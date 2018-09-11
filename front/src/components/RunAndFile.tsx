import React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { Input, InputGroup, InputGroupAddon, InputProps } from 'reactstrap';

import { setRunAndFile } from '../actions';
import { AppState } from '../model';
import { num } from '../util';
import NavButton from './NavButton';

const noNaN = (x: number) => (isNaN(x) ? '' : x.toString());

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
          <Input
            size={num(4)}
            value={noNaN(runno)} // cast to string, avoid NaN in input box
            onChange={this.onChangeRunno}
            onKeyUp={this.onKeyUp}
          />
        </InputGroup>
        <InputGroup className="mr-2">
          <InputGroupAddon addonType="prepend">File</InputGroupAddon>
          <Input
            size={num(3)}
            value={noNaN(fileno)}
            onChange={this.onChangeFileno}
            onKeyUp={this.onKeyUp}
          />
        </InputGroup>
        <NavButton onClick={this.onClick}>GO!</NavButton>
      </div>
    );
  }

  private onClick = () => {
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

  private onKeyUp: InputProps['onKeyUp'] = e => {
    if (e.key === 'Enter') {
      this.onClick();
    }
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
