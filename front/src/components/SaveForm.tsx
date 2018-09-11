import React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { Input, InputGroup, InputGroupAddon, InputProps } from 'reactstrap';

import { setSession } from '../actions';
import { plzReportTaggings } from '../events';
import { AppState } from '../model';
import { num } from '../util';
import NavButton, { Props as ButtonProps } from './NavButton';

type DispatchProps = {
  onSave: (session: string) => any;
};

type State = Readonly<Pick<AppState, 'session'>>;

class SaveFormView extends React.Component<State & DispatchProps, State> {
  public readonly state: State = {
    session: this.props.session,
  };

  public render() {
    const { session } = this.state;
    return (
      <div className="form-inline">
        <InputGroup className="mr-2">
          <InputGroupAddon addonType="prepend">Session name</InputGroupAddon>
          <Input onChange={this.onChange} size={num(12)} value={session} />
        </InputGroup>
        <NavButton onClick={this.onClick}>SAVE</NavButton>
      </div>
    );
  }

  private onChange: InputProps['onChange'] = e => {
    this.setState({ session: e.target.value });
  };

  private onClick: ButtonProps['onClick'] = () => {
    const { onSave } = this.props;
    const { session } = this.state;
    onSave(session);
    plzReportTaggings.next();
  };
}

type StateProps = State & React.Attributes; // Add "key" attribute

const mapStateToProps: MapStateToProps<StateProps, {}, AppState> = ({ session }) => ({
  key: session, // forces reinitialization when props change
  session,
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = {
  onSave: setSession,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SaveFormView);
