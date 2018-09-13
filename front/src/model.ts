export type AppState = {
  atEnd: boolean;
  fields: Field[];
  fileno: number;
  hall: Hall;
  runno: number;
  selectionActive: boolean;
  session: string;
};

export type DataLocation = {
  runno: number;
  fileno: number;
};

export type Field = {
  value: string;
  label: string;
};

export type Hall = 'EH1' | 'EH2' | 'EH3';

export const initialState: AppState = {
  atEnd: false,
  fields: [{ value: 'plikecounts', label: 'Prompt-like counts' }],
  fileno: -1,
  hall: 'EH1',
  runno: -1,
  selectionActive: false,
  session: 'Default session',
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
  latest: { runno: number; fileno: number };
};
