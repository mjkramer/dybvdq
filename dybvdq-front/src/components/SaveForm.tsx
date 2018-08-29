import React from 'react';
import { connect, DispatchProp } from 'react-redux';

import { Input, InputGroup, InputGroupAddon } from 'reactstrap';

import axios from 'axios';

import NavButton, { Props as ButtonProps } from './NavButton';
import { requestTaggings, gotTaggings } from '../actions';
import { AppState } from '../model';

type ViewProps = {
  onClick: ButtonProps['onClick'];
};

const View: React.SFC<ViewProps> = ({ onClick }) => (
  <div className="form-inline">
    <InputGroup className="mr-2">
      <InputGroupAddon addonType="prepend">Session name</InputGroupAddon>
      <Input size={12} defaultValue="Awesome session" />
    </InputGroup>
    <NavButton onClick={onClick}>SAVE</NavButton>
  </div>
);

// XXX replace me with a thunk?

class SaveForm: React.Component {};