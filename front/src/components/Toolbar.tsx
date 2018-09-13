import * as React from 'react';

import HallSelector from './HallSelector';
import RunAndFile from './RunAndFile';
import SessionForm from './SessionForm';
import { NextButton, PrevButton } from './ShiftButton';
import TagSelectionButton from './TagSelectionButton';

export const Toolbar = () => (
  <div className="d-flex justify-content-between mb-2">
    <PrevButton />
    <HallSelector />
    <RunAndFile />
    <SessionForm />
    <TagSelectionButton />
    <NextButton />
  </div>
);

export default Toolbar;
