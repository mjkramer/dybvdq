import { ValueType as SelectValueType } from 'react-select/lib/types';
import { Dispatch } from 'redux';

import { setFields, setLocation, updateEndStatus } from './actions';
import * as api from './api';
import { plzReportTaggings } from './events';
import * as globals from './globals';
import { AppState, Field, Hall } from './model';

export const reportAndSetFields = (fields: SelectValueType<Field>) => (
  dispatch: Dispatch,
) => {
  plzReportTaggings.next();
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

export const reportAndSetRunAndFile = (runno: number, fileno: number) => async (
  dispatch: Dispatch,
  getState: () => AppState,
) => {
  const { hall, session, fields } = getState();

  plzReportTaggings.next();

  const params = { runno, fileno, hall, session, fields };
  fetchWithNewLocation(params, dispatch);
  // const { newRun, newFile } = await fetchWithNewLocation(params);
  // dispatch(setLocation(newRun, newFile, hall));
};

export const reportAndSetHall = (hall: Hall) => async (
  dispatch: Dispatch,
  getState: () => AppState,
) => {
  const { runno, fileno, session, fields } = getState();

  plzReportTaggings.next();
  dispatch(setLocation(-1, -1, hall));

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

  plzReportTaggings.next();
  dispatch(setLocation(-1, -1, hall));

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
  globals.setLatest(latest);

  const hall: Hall = 'EH1';
  const { runno, fileno } = latest[hall];
  const { session, fields } = getState();
  const params = { runno, fileno, hall, session, fields };
  fetchWithNewLocation(params, dispatch);
  // dispatch(setLocation(runno, fileno, hall));
};

const fetchWithNewLocation = async (params: api.FetchDataParams, dispatch: Dispatch) => {
  const data = await api.fetchData(params, { saveToCache: true });

  const newRun = data.runnos[0];
  const newFile = data.filenos[0];
  // const latestRun = data.latest.runno;
  // const latestFile = data.latest.fileno;
  const { hall } = params;
  const atEnd =
    data.runnos[data.runnos.length - 1] === globals.LATEST![hall].runno &&
    data.filenos[data.filenos.length - 1] === globals.LATEST![hall].fileno;

  dispatch(updateEndStatus(atEnd));
  dispatch(setLocation(newRun, newFile, params.hall));
};
