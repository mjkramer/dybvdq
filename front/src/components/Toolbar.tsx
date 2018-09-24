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
    <SessionForm className="mr-4" />
    <TagSelectionButton />
  </div>
);

export default Toolbar;
