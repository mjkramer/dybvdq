import * as React from 'react';

import HallSelector from './HallSelector';
import RunAndFile from './RunAndFile';
import SessionForm from './SessionForm';
import { NextButton, PrevButton } from './ShiftButton';
import TagSelectionButton from './TagSelectionButton';

export const Toolbar = () => (
  <div className="d-flex mb-2">
    <PrevButton className="mr-4" />
    <NextButton className="mr-4" />
    <HallSelector className="mr-4" />
    <RunAndFile />
    <div style={{ flexGrow: 1 }} />
    <div className="mr-4" style={{ flexGrow: 1 }}>
      <SessionForm />
    </div>
    <TagSelectionButton />
  </div>
);

export default Toolbar;
