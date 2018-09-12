import { createActions } from 'redux-actions';

export const {
  setFields,
  setLocation,
  setSession,
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
  },
  'DID_SELECT',
  'DID_DESELECT',
);
