import axios from 'axios';
import React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { Input, InputGroup, InputGroupAddon } from 'reactstrap';

import { gotTaggings, requestTaggings } from '../actions';
import { store } from '../index';
import { DataLocation } from '../model';
import NavButton, { IProps as ButtonProps } from './NavButton';

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

class SaveForm extends React.Component<DispatchProp> {
  private lastTaggings: DataLocation[] = [];

  public componentDidMount() {
    // unsubscribe when we unmount
    this.componentWillUnmount = store.subscribe(this.listener);
  }

  public render() {
    return <View onClick={this.onClick} />;
  }

  private listener = () => {
    const { latestTaggings } = store.getState();
    // If, prior to this listener being called, DataViz's sendTaggings triggers
    // re-renders (and subsequent dispatches) in other components, then this
    // listener may receive stale data in those intermediate state updates, up
    // until the gotTaggings is finally processed. Thus we must keep track of
    // lastTaggings.
    if (latestTaggings.length && latestTaggings !== this.lastTaggings) {
      this.lastTaggings = latestTaggings;
      axios.post('/report_taggings', { taggedIds: latestTaggings });
      store.dispatch(gotTaggings());
    }
  };

  private onClick = () => {
    this.props.dispatch(requestTaggings());
  };
}

export default connect()(SaveForm);
