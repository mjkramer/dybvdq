import React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { Input, InputGroup, InputGroupAddon, InputProps } from 'reactstrap';

import { setRunAndFile } from '../actions';
import { AppState } from '../model';
import { num } from '../util';
import NavButton, { Props as ButtonProps } from './NavButton';

type DispatchProps = {
  onGo: (runno: number, fileno: number) => any;
};

type State = Readonly<Pick<AppState, 'runno' | 'fileno'>>;

class RunAndFileView extends React.Component<State & DispatchProps, State> {
  public readonly state: State = {
    fileno: this.props.fileno,
    runno: this.props.runno,
  };

  public render() {
    const { runno, fileno } = this.state;
    return (
      <div className="form-inline">
        <InputGroup className="mr-2">
          <InputGroupAddon addonType="prepend">Run</InputGroupAddon>
          <Input size={num(4)} value={runno} onChange={this.onChangeRunno} />
        </InputGroup>
        <InputGroup className="mr-2">
          <InputGroupAddon addonType="prepend">File</InputGroupAddon>
          <Input
            size={num(3)}
            value={fileno}
            onChange={this.onChangeFileno}
            // tslint:disable-next-line:jsx-no-lambda
            onSubmit={() => alert('cool')}
          />
        </InputGroup>
        <NavButton onClick={this.onClick}>GO!</NavButton>
      </div>
    );
  }

  private onClick: ButtonProps['onClick'] = () => {
    const { onGo } = this.props;
    const { runno, fileno } = this.state;
    onGo(runno, fileno);
  };

  private onChangeRunno: InputProps['onChange'] = e => {
    this.setState({ runno: parseInt(e.target.value, 10) });
  };

  private onChangeFileno: InputProps['onChange'] = e => {
    this.setState({ fileno: parseInt(e.target.value, 10) });
  };
}

type StateProps = State & React.Attributes; // Add "key" attribute

const mapStateToProps: MapStateToProps<StateProps, {}, AppState> = ({
  fileno,
  runno,
}) => ({
  fileno,
  runno,
  // tslint:disable-next-line:object-literal-sort-keys
  key: `${runno}_${fileno}`, // forces reinitialization when props change
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = {
  onGo: setRunAndFile,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RunAndFileView);
