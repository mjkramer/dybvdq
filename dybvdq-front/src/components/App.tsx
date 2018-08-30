import * as React from 'react';
import { Container } from 'reactstrap';

import Toolbar from './Toolbar';
// import FieldSel from './FieldSel';
// import DataViz from './DataViz';

export default () => (
  <Container>
    <h3 className="mb-4 mt-1">DYB Visual DQ!</h3>
    <Toolbar />
    {/* <div className="mb-2">
      <FieldSel />
    </div>
    <DataViz /> */}
  </Container>
);
