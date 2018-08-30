import React from 'react';
import { connect, DispatchProp, MapStateToProps } from 'react-redux';

import { Input, InputGroup, InputGroupAddon } from 'reactstrap';

import axios from 'axios';

import { gotTaggings, requestTaggings } from '../actions';
import { AppState } from '../model';
import NavButton, { Props as ButtonProps } from './NavButton';

interface IViewProps {
  onClick: ButtonProps['onClick'];
}

const View: React.SFC<IViewProps> = ({ onClick }) => (
  <div className="form-inline">
    <InputGroup className="mr-2">
      <InputGroupAddon addonType="prepend">Session name</InputGroupAddon>
      <Input size={12} defaultValue="Awesome session" />
    </InputGroup>
    <NavButton onClick={onClick}>SAVE</NavButton>
  </div>
);

// XXX replace me with a thunk?

type StateProps = Pick<AppState, 'latestTaggings'>;

class SaveForm extends React.Component<StateProps & DispatchProp> {
  public componentDidUpdate() {
    const { dispatch, latestTaggings } = this.props;

    if (latestTaggings.length !== 0) {
      axios.post('/reportTaggings', { taggedIds: latestTaggings });
      dispatch(gotTaggings());
    }
  }

  public render() {
    return <View onClick={this.onClick} />;
  }

  private onClick() {
    this.props.dispatch(requestTaggings());
  }
}

const mapStateToProps: MapStateToProps<StateProps, {}, AppState> = ({
  latestTaggings,
}) => ({ latestTaggings });

export default connect(mapStateToProps)(SaveForm);
