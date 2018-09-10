export type AppState = {
  runno: number;
  fileno: number;
  hall: string;
  selectedFields: Field[];
  taggingsRequested: boolean;
  latestTaggings: DataLocation[];
  tagSelectionReq: boolean;
  selectionActive: boolean;
};

export type DataLocation = {
  runno: number;
  fileno: number;
};

export type Field = {
  value: string;
  label: string;
};

export const initialState: AppState = {
  fileno: 1,
  hall: 'EH1',
  latestTaggings: [],
  runno: 21221,
  selectedFields: [{ value: 'plikecounts', label: 'Prompt-like counts' }],
  selectionActive: false,
  tagSelectionReq: false,
  taggingsRequested: false,
};

// Now we describe the data provided by the backend

export type DetKey = 'AD1' | 'AD2' | 'AD3' | 'AD4' | 'IWP' | 'OWP';

export type Metric = {
  values: number[];
  errors?: number[];
};

export type MetricSet = { [det in DetKey]: Metric };

export type FileData = {
  runnos: number[];
  filenos: number[];
  metrics: { [fieldName: string]: MetricSet };
};
