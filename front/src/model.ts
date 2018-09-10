export type AppState = {
  fileno: number;
  hall: string;
  latestTaggings: DataLocation[];
  runno: number;
  selectedFields: Field[];
  selectionActive: boolean;
  sessionName: string;
  tagSelectionReq: boolean;
  taggingsRequested: boolean;
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
  sessionName: 'Awesome session',
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
  tagStatus: boolean[];
};
