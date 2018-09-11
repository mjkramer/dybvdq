import { Action, handleActions } from 'redux-actions';

import { AppState, DataLocation, Field, initialState } from './model';

import {
  didDeselect,
  didSelect,
  setFields,
  setHall,
  setRunAndFile,
  setSession,
  shiftPage,
} from './actions';

export default handleActions<AppState, any>(
  {
    [didDeselect as any]: state => ({ ...state, selectionActive: false }),
    [didSelect as any]: state => ({ ...state, selectionActive: true }),
    [setFields as any]: (state, action: Action<Field[]>) => ({
      ...state,
      fields: action.payload!,
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
    [setSession as any]: (state, action: Action<string>) => ({
      ...state,
      session: action.payload!,
    }),
    [shiftPage as any]: (state, action: Action<number>) => ({
      ...state,
      runno: state.runno + 1000 * action.payload!,
    }),
  },
  initialState,
);

// const f = ({a: aa, b: bb} : {a: number, b: string}) => {
//   return aa + 42 + parseInt(bb);
// }

// f({a: 1, b: "hello"});
