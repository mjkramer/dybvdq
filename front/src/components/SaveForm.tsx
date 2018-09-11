import React from 'react';
import { connect, DispatchProp, MapStateToProps } from 'react-redux';
import { Input, InputGroup, InputGroupAddon, InputProps } from 'reactstrap';

import { setSession } from '../actions';
import { plzReportTaggings } from '../events';
import { AppState } from '../model';
import { num } from '../util';
import NavButton, { Props as ButtonProps } from './NavButton';

type ViewProps = {
  onClick: ButtonProps['onClick'];
  onChange: InputProps['onChange'];
  session: string;
};

const View: React.SFC<ViewProps> = ({ onChange, onClick, session }) => (
  <div className="form-inline">
    <InputGroup className="mr-2">
      <InputGroupAddon addonType="prepend">Session name</InputGroupAddon>
      <Input onChange={onChange} size={num(12)} value={session} />
    </InputGroup>
    <NavButton onClick={onClick}>SAVE</NavButton>
  </div>
);

type State = Readonly<Pick<AppState, 'session'>>;

class SaveForm extends React.Component<State & DispatchProp, State> {
  public readonly state: State = {
    session: this.props.session,
  };

  public render() {
    const { session } = this.state;
    return <View onChange={this.onChange} onClick={this.onClick} session={session} />;
  }

  private onChange: ViewProps['onChange'] = e => {
    this.setState({ session: e.target.value });
  };

  private onClick: ViewProps['onClick'] = () => {
    const { session } = this.state;
    this.props.dispatch(setSession(session));
    plzReportTaggings.next();
  };
}

type StateProps = State & React.Attributes; // Add "key" attribute

const mapStateToProps: MapStateToProps<StateProps, {}, AppState> = ({ session }) => ({
  key: session, // forces reinitialization when props change
  session,
});

export default connect(mapStateToProps)(SaveForm);
