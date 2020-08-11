import { createActions } from 'redux-actions';

export const {
  didSelect,
  setFields,
  setLocation,
  setSession,
  updateEndStatus,
  didDeselect,
} = createActions(
  {
    DID_SELECT: (allTagged: boolean) => allTagged,
    SET_FIELDS: labeledFields => labeledFields,
    SET_LOCATION: (runno, fileno, hall) => ({
      fileno,
      hall,
      runno,
    }),
    SET_SESSION: (sessionName: string) => sessionName,
    UPDATE_END_STATUS: (atEnd: boolean) => atEnd,
  },
  'DID_DESELECT',
);
