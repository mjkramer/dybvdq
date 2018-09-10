import axios from 'axios';
import React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { Input, InputGroup, InputGroupAddon, InputProps } from 'reactstrap';

import { gotTaggings, requestTaggings } from '../actions';
import { store } from '../index';
import { DataLocation } from '../model';
import NavButton, { IProps as ButtonProps } from './NavButton';

type ViewProps = {
  onClick: ButtonProps['onClick'];
  onChange: InputProps['onChange'];
  sessionName: string;
};

const View: React.SFC<ViewProps> = ({ onChange, onClick, sessionName }) => (
  <div className="form-inline">
    <InputGroup className="mr-2">
      <InputGroupAddon addonType="prepend">Session name</InputGroupAddon>
      <Input onChange={onChange} size={12} value={sessionName} />
    </InputGroup>
    <NavButton onClick={onClick}>SAVE</NavButton>
  </div>
);

const initialState = {
  sessionName: 'Awesome session',
};

type State = Readonly<typeof initialState>;

class SaveForm extends React.Component<DispatchProp, State> {
  public readonly state: State = initialState;

  private lastTaggings: DataLocation[] = [];

  public componentDidMount() {
    // unsubscribe when we unmount
    this.componentWillUnmount = store.subscribe(this.listener);
  }

  public render() {
    const { sessionName } = this.state;
    return (
      <View onChange={this.onChange} onClick={this.onClick} sessionName={sessionName} />
    );
  }

  private listener = () => {
    const { latestTaggings, hall } = store.getState();
    const { sessionName } = this.state;
    // If, prior to this listener being called, DataViz's sendTaggings triggers
    // re-renders (and subsequent dispatches) in other components, then this
    // listener may receive stale data in those intermediate state updates, up
    // until the gotTaggings is finally processed. Thus we must keep track of
    // lastTaggings.
    if (latestTaggings.length && latestTaggings !== this.lastTaggings) {
      this.lastTaggings = latestTaggings;
      axios.post('/report_taggings', {
        hall,
        session: sessionName,
        taggedIds: latestTaggings,
      });
      store.dispatch(gotTaggings());
    }
  };

  private onChange: ViewProps['onChange'] = e => {
    this.setState({ sessionName: e.target.value });
  };

  private onClick: ViewProps['onClick'] = () => {
    this.props.dispatch(requestTaggings());
  };
}

export default connect()(SaveForm);
