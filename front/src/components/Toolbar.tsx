import * as React from 'react';

import HallSelector from './HallSelector';
import RunAndFile from './RunAndFile';
import SessionForm from './SessionForm';
import ShiftButton from './ShiftButton';
import TagSelectionButton from './TagSelectionButton';

export const Toolbar = () => (
  <div className="d-flex justify-content-between mb-2">
    <ShiftButton count={-1}>PREV</ShiftButton>
    <HallSelector />
    <RunAndFile />
    <SessionForm />
    <TagSelectionButton />
    <ShiftButton count={1}>NEXT</ShiftButton>
  </div>
);

export default Toolbar;
