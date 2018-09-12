import { ValueType as SelectValueType } from 'react-select/lib/types';
import { Dispatch } from 'redux';

import { setFields, setLocation } from './actions';
import * as api from './api';
import { plzReportTaggings } from './events';
import { AppState, Field } from './model';

export const reportAndSetFields = (fields: SelectValueType<Field>) => (
  dispatch: Dispatch,
) => {
  plzReportTaggings.next();
  dispatch(setFields(fields as Field[]));
};

export const reportAndSetRunAndFile = (runno: number, fileno: number) => async (
  dispatch: Dispatch,
  getState: () => AppState,
) => {
  const { hall, session, fields } = getState();

  plzReportTaggings.next();

  const params = { runno, fileno, hall, session, fields };
  const { newRun, newFile } = await fetchWithNewRunAndFile(params);
  dispatch(setLocation(newRun, newFile, hall));
};

export const reportAndSetHall = (hall: string) => async (
  dispatch: Dispatch,
  getState: () => AppState,
) => {
  const { runno, fileno, session, fields } = getState();

  plzReportTaggings.next();
  dispatch(setLocation(-1, -1, hall));

  const params = { runno, fileno, hall, session, fields };
  const { newRun, newFile } = await fetchWithNewRunAndFile(params);
  dispatch(setLocation(newRun, newFile, hall));
};

export const reportAndShiftPage = (count: number) => async (
  dispatch: Dispatch,
  getState: () => AppState,
) => {
  const { runno, fileno, hall, session, fields } = getState();

  plzReportTaggings.next();
  dispatch(setLocation(-1, -1, hall));

  const params = { runno, fileno, hall, session, fields, pageShift: count };
  const { newRun, newFile } = await fetchWithNewRunAndFile(params);
  dispatch(setLocation(newRun, newFile, hall));
};

const fetchWithNewRunAndFile = async (params: api.FetchDataParams) => {
  const data = await api.fetchData(params, { saveToCache: true });
  const newRun = data.runnos[0];
  const newFile = data.filenos[0];
  return { newRun, newFile };
};
