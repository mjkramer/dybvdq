import { Action, handleActions } from 'redux-actions';

import { AppState, DataLocation, Field, initialState } from './model';

import {
  didDeselect,
  didSelect,
  gotTaggings,
  requestTaggings,
  sendTaggings,
  setFields,
  setHall,
  setRunAndFile,
  setSession,
  shiftPage,
  taggedSelection,
  tagSelection,
} from './actions';

export default handleActions<AppState, any>(
  {
    [shiftPage as any]: (state, action: Action<number>) => ({
      ...state,
      runno: state.runno + 1000 * action.payload!,
    }),
    [setHall as any]: (state, action: Action<string>) => ({
      ...state,
      hall: action.payload!,
    }),
    [setRunAndFile as any]: (state, action: Action<DataLocation>) => ({
      ...state,
      fileno: action.payload!.fileno,
      runno: action.payload!.runno,
    }),
    [requestTaggings as any]: state => ({ ...state, taggingsRequested: true }),
    [sendTaggings as any]: (state, action: Action<DataLocation[]>) => ({
      ...state,
      latestTaggings: action.payload!,
      taggingsRequested: false,
    }),
    [setFields as any]: (state, action: Action<Field[]>) => ({
      ...state,
      selectedFields: action.payload!,
    }),
    [gotTaggings as any]: state => ({ ...state, latestTaggings: [] }),
    [tagSelection as any]: state => ({ ...state, tagSelectionReq: true }),
    [taggedSelection as any]: state => ({
      ...state,
      selectionActive: false,
      tagSelectionReq: false,
    }),
    [didSelect as any]: state => ({ ...state, selectionActive: true }),
    [didDeselect as any]: state => ({ ...state, selectionActive: false }),
    [setSession as any]: (state, action: Action<string>) => ({
      ...state,
      sessionName: action.payload!,
    }),
  },
  initialState,
);

// const f = ({a: aa, b: bb} : {a: number, b: string}) => {
//   return aa + 42 + parseInt(bb);
// }

// f({a: 1, b: "hello"});
