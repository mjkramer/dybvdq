import axios from 'axios';
import Plotly from 'plotly.js';
import React from 'react';
import { connect, MapStateToProps, MapDispatchToProps } from 'react-redux';
import 'redux';

import { sendTaggings, taggedSelection, didSelect, didDeselect } from '../actions';
import { Field, FileData, AppState } from '../model';
import {
  defaultPlotlyConfig,
  defaultPlotlyLayout,
  defaultPlotlyTrace,
  isNil,
} from '../util';
import { store } from '..';

const COLORS = ['blue', 'orange'];

const numGraphs = (data: FileData): number => {
  const metricSets = Object.values(data.metrics);
  return metricSets.reduce((sum, metricSet) => sum + Object.keys(metricSet).length, 0);
};

type StateProps = {
  runno: number;
  fileno: number;
  hall: string;
  fields: Field[];
};

type DispatchProps = {
  onSelect(): void;
  onDeselect(): void;
};

const initialState = {
  numDivs: 0,
};

type State = Readonly<typeof initialState>;

class View extends React.PureComponent<StateProps & DispatchProps, State> {
  public readonly state: State = initialState;

  private cachedData: FileData | null = null;
  private colors: string[] = [];
  private divs: Plotly.PlotlyHTMLElement[] = [];
  private selection: number[] = [];

  public componentDidMount() {
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
    this.plot(data);
  }

  public getTaggedIds(): number[] {
    return this.colors.reduce(
      (result, color, idx) => [...result, ...(color === COLORS[1] ? [idx] : [])],
      [] as number[],
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
      const { onSelect } = this.props;

      if (!isNil(eventData)) {
        const pointNumbers = eventData.points.map(p => p.pointNumber);
        this.doSelect(pointNumbers, el);
        onSelect();
      }
    });

    el.on('plotly_deselect', () => {
      const { onDeselect } = this.props;
      this.doSelect([], el);
      onDeselect();
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
    const { runno, fileno, hall, fields } = this.props;

    const fieldStr = fields.map(o => o.value).join(',');
    const url = `/realdata?runno=${runno}&fileno=${fileno}&hall=${hall}&fields=${fieldStr}`;
    const { data } = await axios.get(url);
    return data;
  }

  private plot(data: FileData) {
    const { metrics } = data;
    const firstMetric = metrics[Object.keys(metrics)[0]];
    const detectors = Object.keys(firstMetric);
    detectors.sort();

    const npoints = firstMetric[detectors[0]].values.length;
    this.colors = Array(npoints).fill(COLORS[0]);
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

  // we might have to deborg this
  private zoomOthers(
    eventData: Plotly.PlotRelayoutEvent,
    src: Plotly.PlotlyHTMLElement,
  ) {
    console.log(eventData);
    if (!eventData.xaxis) return;

    const update: Partial<Plotly.Layout> = (() => {
      const range = eventData.xaxis.range;
      if (range && range[0] !== undefined) {
        return { xaxis: { range } };
      } else return { xaxis: { autorange: true } };
    })();

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
  runno: state.runno,
  fileno: state.fileno,
  hall: state.hall,
  fields: state.selectedFields,
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = {
  onSelect: didSelect,
  onDeselect: didDeselect,
};

const ActiveView = connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  { withRef: true },
)(View);

class DataViz extends React.Component {
  // XXX why not createRef<ActiveView>?
  // Seems to be because connect (i.e. typeof ActiveView) yields a
  // ComponentClass, so we get a RefObject of a ComponentClass (i.e. metadata),
  // whereas ActiveView expects to receive a RefObject of a Component as its ref
  viewRef = React.createRef<typeof ActiveView>();

  componentDidMount() {
    // unsubscribe when we unmount
    this.componentWillUnmount = store.subscribe(this.listener);
  }

  render() {
    return <ActiveView ref={this.viewRef as any} />;
  }

  private listener = () => {
    const activeView = this.viewRef.current as any;
    const view = activeView.getWrappedInstance() as View;

    const { taggingsRequested, tagSelectionReq } = store.getState();

    if (taggingsRequested) {
      const taggedIds = view.getTaggedIds();
      store.dispatch(sendTaggings(taggedIds));
    } else if (tagSelectionReq) {
      view.tagSelection();
      store.dispatch(taggedSelection());
    }
  };
}

export default connect()(DataViz);
