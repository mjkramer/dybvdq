import { getStateFromCookies } from 'redux-cookies-middleware';

export type AppState = {
  atEnd: boolean;
  fields: Field[];
  fileno: number;
  hall: Hall;
  runno: number;
  selectionActive: boolean;
  selectionType: SelectionType | null;
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

export type Latest = { [hall in Hall]: DataLocation };

const defaultInitialState: AppState = {
  atEnd: false,
  // XXX should get initial field from backend
  // fields: [{ value: 'plikecounts', label: 'Prompt-like rate, Hz' }],
  fields: [],
  fileno: -1,
  hall: 'EH1',
  runno: -1,
  selectionActive: false,
  selectionType: null,
  session: 'Default session',
};

export const cookiePaths = {
  fields: { name: 'fields' },
  fileno: { name: 'fileno' },
  hall: { name: 'hall' },
  runno: { name: 'runno' },
  session: { name: 'session' },
};

export const initialState: AppState = getStateFromCookies(
  defaultInitialState,
  cookiePaths,
);

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
  xs: number[];
  metrics: { [fieldName: string]: MetricSet };
  taggings: Array<[number, number]>;
  untaggings: Array<[number, number]>;
  official_tags: Array<[number, number]>;
  comments: string[];
  latest: Latest;
};

export type SelectionType = 'Mixed' | 'AllGood' | 'AllBad';
