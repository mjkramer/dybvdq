import { isNil, some, zip } from 'lodash';
import Plotly from 'plotly.js';
import React from 'react';
import { connect, DispatchProp, MapStateToProps } from 'react-redux';
import { Subscription } from 'rxjs';

import { didDeselect, didSelect } from '../actions';
import * as api from '../api';
import { plzReportTaggings, plzTagSelection } from '../events';
import { AppState, DataLocation, Field, FileData, Hall } from '../model';
import { defaultPlotlyConfig, defaultPlotlyLayout, defaultPlotlyTrace } from '../util';

const COLOR_GOOD = 'blue';
const COLOR_BAD = 'orange';

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
  private colors: string[] = [];
  private divs: Plotly.PlotlyHTMLElement[] = [];
  private plotMetadata: PlotMetadata[] = [];
  private iDivOfSelection: number | null = null;
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
    this.divs.forEach(el => Plotly.purge(el));

    // We're doing a NEXT/PREV/SetHall; wait for new runno/fileno
    const { runno, fileno, fields } = this.props;

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
  }

  public componentWillUnmount() {
    while (this.subscriptions.length) {
      this.subscriptions.pop()!.unsubscribe();
    }
  }

  public getTaggedIds(): DataLocation[] {
    const locFor = (idx: number) => ({
      fileno: this.data!.filenos[idx],
      runno: this.data!.runnos[idx],
    });

    return this.colors.reduce(
      (result, color, idx) => [...result, ...(color === COLOR_BAD ? [locFor(idx)] : [])],
      [] as DataLocation[],
    );
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
        this.props.dispatch(didSelect());
      }
    });

    el.on('plotly_deselect', () => {
      this.doSelect([], iDiv);
      this.props.dispatch(didDeselect());
    });

    el.on('plotly_relayout', (eventData: Plotly.PlotRelayoutEvent) => {
      if (!isNil(eventData)) {
        this.zoomOthers(eventData, el);
      }
    });
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
  }

  private async fetchData() {
    const { runno, fileno, hall, session, fields } = this.props;
    return api.fetchData({ runno, fileno, hall, session, fields });
  }

  private reportTaggingsListener = () => {
    const { hall, session } = this.props;
    const taggedIds = this.getTaggedIds();
    const { runnos, filenos } = this.data!;
    const bounds = {
      maxFile: filenos[filenos.length - 1],
      maxRun: runnos[runnos.length - 1],
      minFile: filenos[0],
      minRun: runnos[0],
    };
    api.reportTaggings(hall, session, taggedIds, bounds);
  };

  private tagSelectionListener = () => {
    this.tagSelection();
  };

  private plot(data: FileData) {
    const { runnos, filenos, metrics, tagStatus } = data;
    if (Object.keys(metrics).length === 0) {
      return;
    }

    const firstMetric = metrics[Object.keys(metrics)[0]];
    const detectors = Object.keys(firstMetric);
    detectors.sort();

    const npoints = firstMetric[detectors[0]].values.length;

    // Don't reset taggings if we've only changed the fields
    const { fileno, hall, runno, session } = this.props;
    if (
      fileno !== this.lastLoc.fileno ||
      runno !== this.lastLoc.runno ||
      hall !== this.lastLoc.hall ||
      session !== this.lastLoc.session
    ) {
      this.colors = tagStatus.map(s => (s ? COLOR_BAD : COLOR_GOOD));
    }

    const xs = [...Array(npoints).keys()];
    const labels = zip(runnos, filenos).map(([r, f]) => `Run ${r} file ${f}`);

    this.plotMetadata = [];
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
          ...defaultPlotlyLayout,
        };

        Plotly.react(this.divs[iDiv], [trace], layout, defaultPlotlyConfig);
        this.bindPlotEvents(iDiv);
        this.plotMetadata.push({ name, detName });
      });
    });

    this.lastLoc = { fileno, hall, runno, session };
  }

  private resizeHandler = () => {
    this.divs.forEach(el => {
      Plotly.Plots.resize(el);
    });
  };

  private togglePoints(idxs: number[], iDiv: number) {
    const allTagged = !some(idxs, i => this.colors[i] === COLOR_GOOD);
    idxs.forEach(i => {
      this.colors[i] = allTagged ? COLOR_GOOD : COLOR_BAD;
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
    const update: Partial<Plotly.Layout> | null = (() => {
      if (eventData['xaxis.range[0]'] !== undefined) {
        const range = [eventData['xaxis.range[0]'], eventData['xaxis.range[1]']];
        return { 'xaxis.range': range as [Plotly.Datum, Plotly.Datum] };
      } else if (eventData['xaxis.autorange']) {
        return { 'xaxis.autorange': true };
      } else {
        return null;
      }
    })();

    if (update === null) {
      return;
    }

    this.divs.forEach((el, iDiv) => {
      if (el !== src) {
        el.removeAllListeners();
        el.on('plotly_relayout', () => this.bindPlotEvents(iDiv));
        Plotly.relayout(el, update);
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
