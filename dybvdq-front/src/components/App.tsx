import * as React from 'react';
import { Container } from 'reactstrap';

import DataViz from './DataViz';
import FieldSel from './FieldSel';
import Toolbar from './Toolbar';

export default () => (
  <Container>
    <h3 className="mb-4 mt-1">DYB Visual DQ!</h3>
    <Toolbar />
    <div className="mb-2">
      <FieldSel />
    </div>
    <DataViz />
  </Container>
);
