import { Action, handleActions } from 'redux-actions';

import { AppState, Field, initialState } from './model';

import {
  didDeselect,
  didSelect,
  setFields,
  setLocation,
  setSession,
  updateEndStatus,
} from './actions';

type Loc = Pick<AppState, 'runno' | 'fileno' | 'hall'>;

export default handleActions<AppState, any>(
  {
    [didDeselect as any]: state => ({
      ...state,
      selectionActive: false,
      selectionAllTagged: false,
    }),
    [didSelect as any]: (state, action: Action<boolean>) => ({
      ...state,
      selectionActive: true,
      selectionAllTagged: action.payload!,
    }),
    [setFields as any]: (state, action: Action<Field[]>) => ({
      ...state,
      fields: action.payload!,
    }),
    [setLocation as any]: (state, action: Action<Loc>) => ({
      ...state,
      fileno: action.payload!.fileno,
      hall: action.payload!.hall,
      runno: action.payload!.runno,
    }),
    [setSession as any]: (state, action: Action<string>) => ({
      ...state,
      session: action.payload!,
    }),
    [updateEndStatus as any]: (state, action: Action<boolean>) => ({
      ...state,
      atEnd: action.payload!,
    }),
  },
  initialState,
);
