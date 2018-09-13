import { createActions } from 'redux-actions';

export const {
  setFields,
  setLocation,
  setSession,
  updateEndStatus,
  didSelect,
  didDeselect,
} = createActions(
  {
    SET_FIELDS: labeledFields => labeledFields,
    SET_LOCATION: (runno, fileno, hall) => ({
      fileno,
      hall,
      runno,
    }),
    SET_SESSION: (sessionName: string) => sessionName,
    UPDATE_END_STATUS: (atEnd: boolean) => atEnd,
  },
  'DID_SELECT',
  'DID_DESELECT',
);
