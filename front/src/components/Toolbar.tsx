import * as React from 'react';

import HallSelector from './HallSelector';
import RunAndFile from './RunAndFile';
import SessionSel from './SessionSel';
import { NextButton, PrevButton } from './ShiftButton';
import TagSelectionButtons from './TagSelectionButtons';

export const Toolbar = () => (
  <div className="d-flex mb-2">
    <PrevButton className="mr-4" />
    <NextButton className="mr-4" />
    <HallSelector className="mr-4" />
    <RunAndFile />
    <div style={{ flexGrow: 1 }} />
    <div className="mr-4" style={{ flexGrow: 1, maxWidth: '20em' }}>
      <SessionSel />
    </div>
    <TagSelectionButtons />
  </div>
);

export default Toolbar;
