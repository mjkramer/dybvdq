import { handleActions, Action } from 'redux-actions';

import { State, Location, Field, initialState } from './model';

import {
  setRunAndFile,
  shiftPage,
  setHall,
  requestTaggings,
  sendTaggings,
  setFields,
  gotTaggings,
  tagSelection,
  taggedSelection,
  didSelect,
  didDeselect,
} from './actions';

export default handleActions<State, any>({
  [shiftPage as any]: (state, action: Action<number>) => (
    { ...state, runno: state.runno + 1000 * action.payload! }
  ),
  [setHall as any]: (state, action: Action<string>) => (
    { ...state, hall: action.payload! }
  ),
  [setRunAndFile as any]: (state, action: Action<Location>) => (
    { ...state, runno: action.payload!.runno, fileno: action.payload!.fileno }
  ),
  [requestTaggings as any]: state => (
    { ...state, taggingsRequested: true }
  ),
  [sendTaggings as any]: (state, action: Action<number[]>) => (
    { ...state, taggingsRequested: false, latestTaggings: action.payload! }
  ),
  [setFields as any]: (state, action: Action<Field[]>) => (
    { ...state, selectedFields: action.payload! }
  ),
  [gotTaggings as any]: state => (
    { ...state, latestTaggings: [] }
  ),
  [tagSelection as any]: state => (
    { ...state, tagSelectionReq: true }
  ),
  [taggedSelection as any]: state => (
    { ...state, tagSelectionReq: false, selectionActive: false }
  ),
  [didSelect as any]: state => (
    { ...state, selectionActive: true }
  ),
  [didDeselect as any]: state => (
    { ...state, selectionActive: false }
  ),
}, initialState);

// const f = ({a: aa, b: bb} : {a: number, b: string}) => {
//   return aa + 42 + parseInt(bb);
// }

// f({a: 1, b: "hello"});