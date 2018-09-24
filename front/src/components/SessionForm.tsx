import React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { Input, InputGroup, InputGroupAddon, InputProps } from 'reactstrap';

import { setSession } from '../actions';
import { AppState } from '../model';
import { num } from '../util';
import NavButton from './NavButton';

type DispatchProps = {
  onSwitch: (session: string) => any;
};

type State = Readonly<Pick<AppState, 'session'>>;

type Props = State & DispatchProps & React.HTMLProps<HTMLDivElement>;

class SaveFormView extends React.Component<Props, State> {
  public readonly state: State = {
    session: this.props.session,
  };

  public render() {
    const { session } = this.state;
    const { onSwitch: _, ...divProps } = this.props;
    divProps.className += ' form-inline';
    return (
      <div {...divProps}>
        <InputGroup className="mr-2">
          <InputGroupAddon addonType="prepend">Session</InputGroupAddon>
          <Input
            onChange={this.onChange}
            onKeyUp={this.onKeyUp}
            size={num(12)}
            value={session}
          />
        </InputGroup>
        <NavButton
          disabled={this.state.session === this.props.session}
          onClick={this.onClick}
        >
          SWITCH
        </NavButton>
      </div>
    );
  }

  private onChange: InputProps['onChange'] = e => {
    this.setState({ session: e.target.value });
  };

  private onClick = () => {
    const { onSwitch } = this.props;
    const { session } = this.state;
    onSwitch(session);
  };

  private onKeyUp: InputProps['onKeyUp'] = e => {
    if (e.key === 'Enter') {
      this.onClick();
    }
  };
}

type StateProps = State & React.Attributes; // Add "key" attribute

const mapStateToProps: MapStateToProps<StateProps, {}, AppState> = ({ session }) => ({
  key: session, // forces reinitialization when props change
  session,
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = {
  onSwitch: setSession,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SaveFormView);
