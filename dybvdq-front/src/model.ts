export type State = {
  runno: number;
  fileno: number;
  hall: string;
  selectedFields: Field[];
  taggingsRequested: boolean;
  latestTaggings: number[];
  tagSelectionReq: boolean;
  selectionActive: boolean;
};

export type Location = {
  runno: number;
  fileno: number;
};

export type Field = {
  value: string;
  label: string;
};

export const initialState: State = {
  runno: 21221,
  fileno: 1,
  hall: "EH1",
  selectedFields: [{ value: "plikecounts", label: "Prompt-like counts" }],
  taggingsRequested: false,
  latestTaggings: [],
  tagSelectionReq: false,
  selectionActive: false
};
