import { isNil, mean, some, zip } from 'lodash';
import Plotly from 'plotly.js';
import React from 'react';
import { connect, DispatchProp, MapStateToProps } from 'react-redux';
import { Subscription } from 'rxjs';

import { didDeselect, didSelect } from '../actions';
import * as api from '../api';
import { plzReportTaggings, plzTagSelection } from '../events';
import { AppState, DataLocation, Field, FileData, Hall } from '../model';
import { defaultPlotlyConfig, defaultPlotlyLayout, defaultPlotlyTrace } from '../util';

const COLOR_GOOD = 'blue'; // neither user-tagged nor official-tagged
const COLOR_TAGGED = 'orange'; // user-tagged but not officially tagged
const COLOR_UNTAGGED = 'green'; // officially tagged, user-untagged
const COLOR_OFFICIAL = 'red'; // officialy tagged

const XAXIS_MARGIN = 10;

const numGraphs = (data: FileData): number => {
  const metricSets = Object.values(data.metrics);
  return metricSets.reduce((sum, metricSet) => sum + Object.keys(metricSet).length, 0);
};

type PlotMetadata = {
  name: string;
  detName: string;
};

type StateProps = {
  runno: number;
  fileno: number;
  hall: Hall;
  session: string;
  fields: Field[];
};

const initialState = {
  // XXX use a ref to the root div and appendChild
  numDivs: 0,
};

type State = Readonly<typeof initialState>;

class DataVizView extends React.PureComponent<StateProps & DispatchProp, State> {
  public readonly state: State = initialState;

  private data: FileData | null = null;
  private cachedData: FileData | null = null;

  private colors: string[] = []; // size: total # of files
  private comments: { [idx: number]: string } = {};

  private divs: Plotly.PlotlyHTMLElement[] = [];
  private iDivOfSelection: number | null = null;

  private plotMetadata: PlotMetadata[] = [];
  private plotAverages: number[] = [];
  private plotValues: number[][] = [];

  // XXX replace me with a key
  private lastLoc: DataLocation & { hall: string; session: string } = {
    fileno: 0,
    hall: '',
    runno: 0,
    session: '',
  };
  private selection: number[] = [];
  private subscriptions: Subscription[] = [];

  public componentDidMount() {
    const subs = this.subscriptions;
    subs.push(plzReportTaggings.subscribe(this.reportTaggingsListener));
    subs.push(plzTagSelection.subscribe(this.tagSelectionListener));
    window.addEventListener('resize', this.resizeHandler);
    this.componentDidUpdate();
  }

  public async componentDidUpdate() {
    const { runno, fileno, fields, hall, session } = this.props;

    this.clearPlots();

    // We're doing a NEXT/PREV/SetHall; wait for new runno/fileno
    if (Object.keys(fields).length === 0 || runno === -1 || fileno === -1) {
      return;
    }

    const data = this.cachedData || (await this.fetchData());

    // If data is fresh (i.e. cachedData is null), we must check that we've got
    // the right number of divs, and if we don't, then we must re-render the
    // component, in which case we'll cache the data for the next
    // componentDidUpdate. Once we implement our own DOM manipulation, we can
    // get rid of this caching logic.
    if (!this.cachedData) {
      const { numDivs } = this.state;
      const newNumDivs = numGraphs(data);

      if (numDivs !== newNumDivs) {
        this.cachedData = data;
        this.setState({ numDivs: newNumDivs });
        return;
      }
    }

    this.cachedData = null;
    this.data = data;
    this.plot(data);

    this.lastLoc = { fileno, hall, runno, session }; // must happen at the end!
  }

  public componentWillUnmount() {
    while (this.subscriptions.length) {
      this.subscriptions.pop()!.unsubscribe();
    }
  }

  public getTaggings(): [Array<[number, number]>, Array<[number, number]>, string[]] {
    const taggings: Array<[number, number]> = [];
    const untaggings: Array<[number, number]> = [];
    const comments: string[] = [];

    this.colors.forEach((color, idx) => {
      if (color === COLOR_TAGGED || color === COLOR_UNTAGGED) {
        const loc = [this.data!.runnos[idx], this.data!.filenos[idx]];
        if (color === COLOR_TAGGED) {
          taggings.push(loc as [number, number]);
          comments.push(this.comments[idx]);
        } else {
          untaggings.push(loc as [number, number]);
        }
      }
    });

    return [taggings, untaggings, comments];
  }

  public render() {
    // tslint:disable-next-line:no-console
    console.log('render');

    const { numDivs } = this.state;
    this.divs = [];

    return (
      <div>
        {[...Array(numDivs)].map((_, i) => (
          <div
            key={i}
            ref={el => {
              // The ref gets called (with null) when the div is destroyed by
              // the DOM. Thus we must take care not to pollute our array.
              if (el) {
                this.divs[i] = el as any;
              }
            }}
          />
        ))}
      </div>
    );
  }

  public tagSelection() {
    this.togglePoints(this.selection, this.iDivOfSelection!);
    this.doSelect([], null);
  }

  private bindPlotEvents(iDiv: number) {
    const el: Plotly.PlotlyHTMLElement = this.divs[iDiv];
    el.removeAllListeners();

    el.on('plotly_click', (eventData: Plotly.PlotMouseEvent) => {
      if (!isNil(eventData)) {
        const pointNumbers = eventData.points.map(p => p.pointNumber);
        this.togglePoints(pointNumbers, iDiv);
      }
    });

    el.on('plotly_selected', (eventData: Plotly.PlotSelectionEvent) => {
      if (!isNil(eventData)) {
        const pointNumbers = eventData.points.map(p => p.pointNumber);
        this.doSelect(pointNumbers, iDiv);
      }
    });

    el.on('plotly_deselect', () => {
      this.doSelect([], iDiv);
    });

    el.on('plotly_relayout', (eventData: Plotly.PlotRelayoutEvent) => {
      if (!isNil(eventData)) {
        this.zoomOthers(eventData, el);
      }
    });
  }

  private clearPlots() {
    const { runno, fileno, hall, session } = this.props;

    // Are we "sliding" or changing sessions? if so, don't remove axes
    if (
      (hall === this.lastLoc.hall &&
        runno !== this.lastLoc.runno &&
        fileno !== this.lastLoc.fileno) ||
      session !== this.lastLoc.session
    ) {
      this.divs.forEach(el => {
        // If plot is already empty, deleteTraces will throw
        try {
          Plotly.deleteTraces(el, 0);
        } catch {
          return;
        }
      });
    } else {
      // We're changing fields/hall. Purge the plots, since the labels will
      // change. Once we have deterministic ordering of fields, we can perhaps
      // leave the axes in place for a change of fields, and only do a full
      // purge when changing halls.
      this.divs.forEach(el => Plotly.purge(el));
    }

    // clear the convenience data we use elsewhere
    this.plotMetadata = [];
    this.plotAverages = [];
    this.plotValues = [];
  }

  private doSelect(pointNumbers: number[], iDiv: number | null) {
    this.selection = pointNumbers;
    const allPoints = () => [...Array(this.colors.length).keys()];
    const update = {
      selectedpoints: [pointNumbers.length ? pointNumbers : allPoints()],
    };

    this.divs.forEach((el, i) => {
      if (i !== iDiv) {
        // No need to clear/rebind event handlers because setting
        // selectedpoints does not trigger plotly_selected/deselect
        Plotly.restyle(el, update, [0]);
      }
    });

    this.iDivOfSelection = pointNumbers.length ? iDiv : null;

    const action = pointNumbers.length ? didSelect() : didDeselect();
    this.props.dispatch(action);
  }

  private async fetchData() {
    const { runno, fileno, hall, session, fields } = this.props;
    return api.fetchData({ runno, fileno, hall, session, fields });
  }

  private plotWidth() {
    // HACK: Plotly (at least this version) is inconsistent in autosizing the
    // plots. It should use the body's width, minus 30px (15px padding each
    // side). Sometimes it does, but sometimes it only subtracts 15px! WTF!
    return document.getElementsByTagName('body')[0].clientWidth - 30;
  }

  private reportTaggingsListener = () => {
    const { hall, session } = this.props;
    const [taggings, untaggings, comments] = this.getTaggings();
    const { runnos, filenos } = this.data!;
    const bounds = {
      maxFile: filenos[filenos.length - 1],
      maxRun: runnos[runnos.length - 1],
      minFile: filenos[0],
      minRun: runnos[0],
    };
    api.reportTaggings(hall, session, bounds, taggings, untaggings, comments);
  };

  private tagSelectionListener = () => {
    this.tagSelection();
  };

  private updateTaggings(data: FileData) {
    // Don't reset taggings if we've only changed the fields
    const { fileno, hall, runno, session } = this.props;
    if (
      fileno !== this.lastLoc.fileno ||
      runno !== this.lastLoc.runno ||
      hall !== this.lastLoc.hall ||
      session !== this.lastLoc.session
    ) {
      const { runnos, filenos, taggings, untaggings, official_tags, comments } = data;
      const locToIndex: { [loc: string]: number } = {};
      zip(runnos, filenos).forEach(([r, f], i) => {
        locToIndex[`${r}_${f}`] = i;
      });

      const npoints = runnos.length;
      this.colors = Array(npoints).fill(COLOR_GOOD);
      this.comments = {};

      zip(taggings, comments).forEach(([[r, f], c]) => {
        const idx = locToIndex[`${r}_${f}`];
        this.colors[idx] = COLOR_TAGGED;
        this.comments[idx] = c!;
      });

      untaggings.forEach(([r, f]) => {
        const idx = locToIndex[`${r}_${f}`];
        this.colors[idx] = COLOR_UNTAGGED;
      });

      official_tags.forEach(([r, f]) => {
        const idx = locToIndex[`${r}_${f}`];
        this.colors[idx] = COLOR_OFFICIAL;
      });
    }
  }

  private plot(data: FileData) {
    const { runnos, filenos, xs, metrics } = data;
    if (Object.keys(metrics).length === 0) {
      return;
    }

    this.updateTaggings(data);

    const npoints = runnos.length;
    const labels = zip(runnos, filenos).map(([r, f]) => `Run ${r} file ${f}`);
    const width = this.plotWidth();

    let iDiv = -1;

    Object.entries(metrics).forEach(([name, metricSet]) => {
      Object.entries(metricSet).forEach(([detName, dataForDet]) => {
        iDiv += 1;

        const ys = dataForDet.values;

        const trace: Plotly.Data = {
          marker: {
            color: this.colors,
          },
          text: labels,
          x: xs,
          y: ys,
          ...defaultPlotlyTrace,
        };

        const layout: Partial<Plotly.Layout> = {
          title: `${name} (${detName})`,
          // NB: 'xaxis.range' doesn't work here
          width,
          xaxis: { range: [-XAXIS_MARGIN, npoints + XAXIS_MARGIN] },
          ...defaultPlotlyLayout,
        };

        Plotly.react(this.divs[iDiv], [trace], layout, defaultPlotlyConfig);
        this.bindPlotEvents(iDiv);
        this.plotMetadata.push({ name, detName });
        this.plotAverages.push(mean(ys));
        this.plotValues.push(ys);
      });
    });
  }

  private relayout(iDiv: number, update: Partial<Plotly.Layout>) {
    const el = this.divs[iDiv];
    el.removeAllListeners();
    el.on('plotly_relayout', () => this.bindPlotEvents(iDiv));
    Plotly.relayout(el, update);
  }

  private resizeHandler = () => {
    const width = this.plotWidth();
    this.divs.forEach((_, iDiv) => {
      this.relayout(iDiv, { width });
      // Plotly.Plots.resize(el);
    });
  };

  private stripUnit(plotName: string): string {
    // blah blah blah, Hz -> blah blah blah
    const words = plotName.split(' ').slice(0, -1);
    const last = words[words.length - 1];
    const newWords = [...words.slice(0, -1), last.slice(0, -1)];
    return newWords.join(' ');
  }

  private togglePoints(idxs: number[], iDiv: number) {
    const { name, detName } = this.plotMetadata[iDiv];
    const nameWithoutUnit = this.stripUnit(name);
    const baseComment = `${detName} ${nameWithoutUnit}`;

    const untoggle = !some(
      idxs,
      i => this.colors[i] === COLOR_GOOD || this.colors[i] === COLOR_UNTAGGED,
    );

    idxs.forEach(i => {
      if (untoggle) {
        if (this.colors[i] === COLOR_TAGGED) {
          this.colors[i] = COLOR_GOOD;
          delete this.comments[i];
        } else if (this.colors[i] === COLOR_OFFICIAL) {
          this.colors[i] = COLOR_UNTAGGED;
        }
      } else {
        const high = this.plotValues[iDiv][i] > this.plotAverages[iDiv];
        if (this.colors[i] === COLOR_GOOD) {
          const comment = `${baseComment}: ${high ? 'HIGH' : 'LOW'}`;
          this.comments[i] = comment;
          this.colors[i] = COLOR_TAGGED;
        } else if (this.colors[i] === COLOR_UNTAGGED) {
          this.colors[i] = COLOR_OFFICIAL;
        }
      }
    });

    this.divs.forEach(div => {
      Plotly.restyle(div, { 'marker.color': [this.colors] }, [0]);
    });
  }

  // XXX we might have to deborg this
  private zoomOthers(
    eventData: Plotly.PlotRelayoutEvent,
    src: Plotly.PlotlyHTMLElement,
  ) {
    const zoomingToBox = eventData['xaxis.range[0]'] !== undefined;
    const unzooming = eventData['xaxis.autorange'];

    let range: [number, number];
    if (zoomingToBox) {
      range = [eventData['xaxis.range[0]'], eventData['xaxis.range[1]']];
    } else if (unzooming) {
      const npoints = this.data!.runnos.length;
      range = [-XAXIS_MARGIN, npoints + XAXIS_MARGIN];
    } else {
      return;
    }

    const update: Partial<Plotly.Layout> = {
      xaxis: { range },
    };

    this.divs.forEach((el, iDiv) => {
      if (unzooming || (zoomingToBox && el !== src)) {
        this.relayout(iDiv, update);
      }
    });
  }
}

const mapStateToProps: MapStateToProps<StateProps, {}, AppState> = state => ({
  fields: state.fields,
  fileno: state.fileno,
  hall: state.hall,
  runno: state.runno,
  session: state.session,
});

export default connect(mapStateToProps)(DataVizView);
