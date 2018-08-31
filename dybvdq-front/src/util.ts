import Plotly from 'plotly.js';

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

export const isNil = (x: any) => x === undefined || x === null;

declare module 'plotly.js' {
  interface PlotlyHTMLElement {
    removeAllListeners(): void;
  }
  interface PlotData {
    selectedpoints: number[][];
  }
}

export const defaultPlotlyTrace: Plotly.Data = {
  mode: 'markers',
  type: 'scattergl',
};

export const defaultPlotlyLayout: Partial<Plotly.Layout> = {
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
