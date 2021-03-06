import { ValueType as SelectValueType } from 'react-select/lib/types';
import { Dispatch } from 'redux';

import { setFields, setLocation, updateEndStatus } from './actions';
import * as api from './api';
import { plzReportTaggings } from './events';
import * as globals from './globals';
import { AppState, Field, Hall } from './model';

export const reportAndSetFields = (fields: SelectValueType<Field>) => async (
  dispatch: Dispatch,
  getState: () => AppState,
) => {
  await flush(dispatch, getState, false);
  dispatch(setFields(fields as Field[]));
};

// Called on app startup. Ensures that latestRun/File are set, as a bonus
// it preloads plot data.
// export const initLocation = (runno: number, fileno: number, hall: string) => async (
//   dispatch: Dispatch,
//   getState: () => AppState,
// ) => {
//   const { session, fields } = getState();

//   const params = { runno, fileno, hall, session, fields };
//   fetchWithNewLocation(params, dispatch);
// };

const flush = async (dispatch: Dispatch, getState: () => AppState, blankLoc = true) => {
  plzReportTaggings.next();
  if (blankLoc) {
    dispatch(setLocation(-1, -1, getState().hall));
  }
  await api.reportTaggingsPromise;
};

export const reportAndSetRunAndFile = (runno: number, fileno: number) => async (
  dispatch: Dispatch,
  getState: () => AppState,
) => {
  const { hall, session, fields } = getState();

  await flush(dispatch, getState);

  const params = { runno, fileno, hall, session, fields };
  fetchWithNewLocation(params, dispatch);
  // const { newRun, newFile } = await fetchWithNewLocation(params);
  // dispatch(setLocation(newRun, newFile, hall));
};

export const reportAndSetHall = (hall: Hall) => async (
  dispatch: Dispatch,
  getState: () => AppState,
) => {
  const { session, fields, atEnd } = getState();
  let { runno, fileno } = getState();

  await flush(dispatch, getState);

  if (atEnd) {
    const latest = globals.LATEST![hall];
    [runno, fileno] = [latest.runno, latest.fileno];
  }

  const params = { runno, fileno, hall, session, fields };
  fetchWithNewLocation(params, dispatch);
  // const { newRun, newFile } = await fetchWithNewLocation(params);
  // dispatch(setLocation(newRun, newFile, hall));
};

export const reportAndShiftPage = (count: number) => async (
  dispatch: Dispatch,
  getState: () => AppState,
) => {
  const { runno, fileno, hall, session, fields } = getState();

  await flush(dispatch, getState);

  const params = { runno, fileno, hall, session, fields, pageShift: count };
  fetchWithNewLocation(params, dispatch);
  // const { newRun, newFile } = await fetchWithNewLocation(params);
  // dispatch(setLocation(newRun, newFile, hall));
};

export const initLocation = () => async (
  dispatch: Dispatch,
  getState: () => AppState,
) => {
  const latest = await api.latest();

  const { hall, runno, fileno, session, fields } = getState();
  const params = {
    fields,
    fileno: fileno === -1 ? latest[hall].fileno : fileno,
    hall,
    runno: runno === -1 ? latest[hall].runno : runno,
    session,
  };
  fetchWithNewLocation(params, dispatch);
};

const fetchWithNewLocation = async (params: api.FetchDataParams, dispatch: Dispatch) => {
  // const data = await api.fetchData(params, { saveToCache: true });
  const data = await api.fetchData(params);

  const { runnos, filenos, latest } = data;
  const newRun = runnos[0];
  const newFile = filenos[0];
  const { hall } = params;
  const atEnd =
    runnos[runnos.length - 1] === latest[hall].runno &&
    filenos[filenos.length - 1] === latest[hall].fileno;

  globals.setLatest(latest);
  dispatch(updateEndStatus(atEnd));
  dispatch(setLocation(newRun, newFile, hall));
};
