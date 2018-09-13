import { Action, handleActions } from 'redux-actions';

import { AppState, Field, initialState } from './model';

import { didDeselect, didSelect, setFields, setLocation, setSession } from './actions';

type Loc = Pick<AppState, 'runno' | 'fileno' | 'hall' | 'latestRun' | 'latestFile'>;

export default handleActions<AppState, any>(
  {
    [didDeselect as any]: state => ({ ...state, selectionActive: false }),
    [didSelect as any]: state => ({ ...state, selectionActive: true }),
    [setFields as any]: (state, action: Action<Field[]>) => ({
      ...state,
      fields: action.payload!,
    }),
    [setLocation as any]: (state, action: Action<Loc>) => ({
      ...state,
      fileno: action.payload!.fileno,
      hall: action.payload!.hall,
      latestFile: action.payload!.latestFile,
      latestRun: action.payload!.latestRun,
      runno: action.payload!.runno,
    }),
    [setSession as any]: (state, action: Action<string>) => ({
      ...state,
      session: action.payload!,
    }),
  },
  initialState,
);
