export interface IAppState {
  runno: number;
  fileno: number;
  hall: string;
  selectedFields: IField[];
  taggingsRequested: boolean;
  latestTaggings: number[];
  tagSelectionReq: boolean;
  selectionActive: boolean;
}

export interface ILocation {
  runno: number;
  fileno: number;
}

export interface IField {
  value: string;
  label: string;
}

export const initialState: IAppState = {
  fileno: 1,
  hall: 'EH1',
  latestTaggings: [],
  runno: 21221,
  selectedFields: [{ value: 'plikecounts', label: 'Prompt-like counts' }],
  selectionActive: false,
  tagSelectionReq: false,
  taggingsRequested: false,
};
