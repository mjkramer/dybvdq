import { Dispatch } from 'redux';
import { Action, ActionFunctionAny } from 'redux-actions';

import { setFields, setHall, setRunAndFile, shiftPage } from './actions';
import { plzReportTaggings } from './events';

// Create a thunk that yells "please report taggings!" before dispatching the
// provided action
const makeReportingAction = <T>(action: ActionFunctionAny<Action<T>>) => (
  ...args: any[]
) => (dispatch: Dispatch) => {
  plzReportTaggings.next();
  dispatch(action(...args));
};

export const doSetFields = makeReportingAction(setFields);
export const doSetHall = makeReportingAction(setHall);
export const doSetRunAndFile = makeReportingAction(setRunAndFile);
export const doShiftPage = makeReportingAction(shiftPage);
