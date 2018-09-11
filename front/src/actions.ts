import { createActions } from 'redux-actions';

export const {
  setFields,
  setHall,
  setRunAndFile,
  setSession,
  shiftPage,
  didSelect,
  didDeselect,
} = createActions(
  {
    SET_FIELDS: labeledFields => labeledFields,
    SET_HALL: hall => hall,
    SET_RUN_AND_FILE: (runno, fileno) => ({ runno, fileno }),
    SET_SESSION: (sessionName: string) => sessionName,
    SHIFT_PAGE: count => count,
  },
  'DID_SELECT',
  'DID_DESELECT',
);
