import Plotly from 'plotly.js';

export const FIRST_RUN = {
  EH1: 21221,
  EH2: 21222,
  EH3: 21223,
};

export const DEFAULT_FIELD = 'plikecounts';

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

// Helper to convert a number to string while telling TS it's still a number.
// Used for reactstrap.Input.size, which is typed as a number in TS but as a
// string by the PropTypes, resulting in a runtime warning if we naively obey
// the compiler.
export const num = (x: number) => (x.toString() as any) as number;

declare module 'plotly.js' {
  interface PlotlyHTMLElement {
    data: object;
    removeAllListeners(): void;
  }
  interface PlotData {
    selectedpoints: number[][];
  }
}

export const defaultPlotlyTrace: Plotly.Data = {
  mode: 'markers',
  // type: 'scattergl',
  type: 'scatter',
};

export const defaultPlotlyLayout: Partial<Plotly.Layout> = {
  // autosize: true,
  height: 200,
  hovermode: 'closest',
  margin: { b: 30, l: 50, r: 50, t: 30 },
  showlegend: false,
};

export const defaultPlotlyConfig: Partial<Plotly.Config> = {
  autosizable: false,
  displayModeBar: 'hover',
  displaylogo: true,
  doubleClick: 'reset+autosize',
  editable: false,
  edits: {
    annotationPosition: false,
    annotationTail: false,
    annotationText: false,
    axisTitleText: false,
    colorbarPosition: false,
    colorbarTitleText: false,
    legendPosition: false,
    legendText: false,
    shapePosition: false,
    titleText: false,
  },
  fillFrame: false,
  frameMargins: 0,
  linkText: 'Edit chart',
  modeBarButtons: false,
  modeBarButtonsToAdd: [],
  modeBarButtonsToRemove: [],
  plotGlPixelRatio: 2,
  queueLength: 0,
  scrollZoom: false,
  sendData: true,
  showAxisDragHandles: true,
  showAxisRangeEntryBoxes: true,
  showLink: false,
  showSources: false,
  showTips: true,
  staticPlot: false,
  topojsonURL: 'https://cdn.plot.ly/',
};
