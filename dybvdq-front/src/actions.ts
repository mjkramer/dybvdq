import { createActions } from 'redux-actions';

export const {
  sendTaggings,
  setFields,
  setHall,
  setRunAndFile,
  shiftPage,
  requestTaggings,
  gotTaggings,
  tagSelection,
  taggedSelection,
  didSelect,
  didDeselect,
} = createActions(
  {
    SEND_TAGGINGS: taggedIds => taggedIds,
    SET_FIELDS: labeledFields => labeledFields,
    SET_HALL: hall => hall,
    SET_RUN_AND_FILE: (runno, fileno) => ({ runno, fileno }),
    SHIFT_PAGE: count => count,
  },
  'REQUEST_TAGGINGS',
  'GOT_TAGGINGS',
  'TAG_SELECTION',
  'TAGGED_SELECTION',
  'DID_SELECT',
  'DID_DESELECT',
);
