import Plotly from 'plotly.js';
import React from 'react';
import { connect, DispatchProp, MapStateToProps } from 'react-redux';
import { Subscription } from 'rxjs';

import { didDeselect, didSelect } from '../actions';
import * as api from '../api';
import { plzReportTaggings, plzTagSelection } from '../events';
import { AppState, DataLocation, Field, FileData } from '../model';
import {
  defaultPlotlyConfig,
  defaultPlotlyLayout,
  defaultPlotlyTrace,
  isNil,
} from '../util';

const COLORS = ['blue', 'orange'];

const numGraphs = (data: FileData): number => {
  const metricSets = Object.values(data.metrics);
  return metricSets.reduce((sum, metricSet) => sum + Object.keys(metricSet).length, 0);
};

type StateProps = {
  runno: number;
  fileno: number;
  hall: string;
  session: string;
  fields: Field[];
};

const initialState = {
  numDivs: 0,
};

type State = Readonly<typeof initialState>;

class View extends React.Component<StateProps & DispatchProp, State> {
  public readonly state: State = initialState;

  private data: FileData | null = null;
  private cachedData: FileData | null = null;
  private colors: string[] = [];
  private divs: Plotly.PlotlyHTMLElement[] = [];
  private lastLoc: DataLocation & { hall: string } = { fileno: 0, runno: 0, hall: '' };
  private selection: number[] = [];
  private subscriptions: Subscription[] = [];

  public componentDidMount() {
    const subs = this.subscriptions;
    subs.push(plzReportTaggings.subscribe(this.reportTaggingsListener));
    subs.push(plzTagSelection.subscribe(this.tagSelectionListener));
    this.componentDidUpdate();
  }

  public async componentDidUpdate() {
    const data = this.cachedData || (await this.fetchData());

    // If data is fresh (i.e. cachedData is null), we must check that we've got
    // the right number of divs, and if we don't, then we must re-render the
    // component, in which case we'll cache the data for the next
    // componentDidUpdate
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

  // Don't rerender when just the session changes
  public shouldComponentUpdate(nextProps: StateProps, nextState: State) {
    return (
      !!this.cachedData ||
      nextProps.runno !== this.props.runno ||
      nextProps.fileno !== this.props.fileno ||
      nextProps.hall !== this.props.hall ||
      nextProps.fields !== this.props.fields
    );
  }

  public getTaggedIds(): DataLocation[] {
    const locFor = (idx: number) => ({
      fileno: this.data!.filenos[idx],
      runno: this.data!.runnos[idx],
    });

    return this.colors.reduce(
      (result, color, idx) => [...result, ...(color === COLORS[1] ? [locFor(idx)] : [])],
      [] as DataLocation[],
    );
  }

  public render() {
    const { numDivs } = this.state;
    this.divs = [];

    return (
      <div>
        {[...Array(numDivs)].map((_, i) => (
          <div
            key={i}
            ref={el => {
              this.divs[i] = el as any;
            }}
          />
        ))}
      </div>
    );
  }

  public tagSelection() {
    this.togglePoints(this.selection);
    this.doSelect([], null);
  }

  private bindPlotEvents(el: Plotly.PlotlyHTMLElement) {
    el.removeAllListeners();

    el.on('plotly_click', (eventData: Plotly.PlotMouseEvent) => {
      if (!isNil(eventData)) {
        const pointNumbers = eventData.points.map(p => p.pointNumber);
        this.togglePoints(pointNumbers);
      }
    });

    el.on('plotly_selected', (eventData: Plotly.PlotSelectionEvent) => {
      if (!isNil(eventData)) {
        const pointNumbers = eventData.points.map(p => p.pointNumber);
        this.doSelect(pointNumbers, el);
        this.props.dispatch(didSelect());
      }
    });

    el.on('plotly_deselect', () => {
      this.doSelect([], el);
      this.props.dispatch(didDeselect());
    });

    el.on('plotly_relayout', (eventData: Plotly.PlotRelayoutEvent) => {
      if (!isNil(eventData)) {
        this.zoomOthers(eventData, el);
      }
    });
  }

  private doSelect(pointNumbers: number[], src: Plotly.PlotlyHTMLElement | null) {
    this.selection = pointNumbers;
    const allPoints = () => [...Array(this.colors.length).keys()];
    const update = {
      selectedpoints: [pointNumbers.length ? pointNumbers : allPoints()],
    };

    this.divs.forEach(el => {
      if (el !== src) {
        // No need to clear/rebind event handlers because setting
        // selectedpoints does not trigger plotly_selected/deselect
        Plotly.restyle(el, update, [0]);
      }
    });
  }

  private async fetchData() {
    const { runno, fileno, hall, session, fields } = this.props;
    return api.fetchData(runno, fileno, hall, session, fields);
  }

  private reportTaggingsListener = () => {
    const { hall, session } = this.props;
    const taggedIds = this.getTaggedIds();
    api.reportTaggings(hall, session, taggedIds);
  };

  private tagSelectionListener = () => {
    this.tagSelection();
  };

  private plot(data: FileData) {
    const { metrics, tagStatus } = data;
    const firstMetric = metrics[Object.keys(metrics)[0]];
    const detectors = Object.keys(firstMetric);
    detectors.sort();

    const npoints = firstMetric[detectors[0]].values.length;

    // Don't reset taggings if we've only changed the fields
    const { fileno, hall, runno } = this.props;
    if (
      fileno !== this.lastLoc.fileno ||
      runno !== this.lastLoc.runno ||
      hall !== this.lastLoc.hall
    ) {
      this.colors = tagStatus.map(s => (s ? COLORS[1] : COLORS[0]));
    }

    const xs = [...Array(npoints).keys()];

    let iDiv = -1;

    Object.entries(metrics).forEach(([name, metricSet]) => {
      Object.entries(metricSet).forEach(([detName, dataForDet]) => {
        iDiv += 1;

        const ys = dataForDet.values;

        const trace: Plotly.Data = {
          marker: {
            color: this.colors,
          },
          x: xs,
          y: ys,
          ...defaultPlotlyTrace,
        };

        const layout: Partial<Plotly.Layout> = {
          title: `${name} (${detName})`,
          ...defaultPlotlyLayout,
        };

        Plotly.react(this.divs[iDiv], [trace], layout, defaultPlotlyConfig);
        this.bindPlotEvents(this.divs[iDiv]);
      });
    });

    this.lastLoc = { fileno, hall, runno };
  }

  private togglePoints(idxs: number[]) {
    idxs.forEach(i => {
      const oldColor = this.colors[i];
      const newColor = oldColor === COLORS[0] ? COLORS[1] : COLORS[0];
      this.colors[i] = newColor;
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
    // tslint:disable-next-line:no-console
    console.log(eventData);

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

    this.divs.forEach(el => {
      if (el !== src) {
        el.removeAllListeners();
        el.on('plotly_relayout', () => this.bindPlotEvents(el));
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

export default connect(mapStateToProps)(View);
