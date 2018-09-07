import * as React from 'react';

import HallSelector from './HallSelector';
import RunAndFile from './RunAndFile';
import SaveForm from './SaveForm';
import ShiftButton from './ShiftButton';
import TagSelectionButton from './TagSelectionButton';

export default () => (
  <div className="d-flex justify-content-between mb-2">
    <ShiftButton count={-1}>PREV</ShiftButton>
    <HallSelector />
    <RunAndFile />
    <SaveForm />
    <TagSelectionButton />
    <ShiftButton count={1}>NEXT</ShiftButton>
  </div>
);
