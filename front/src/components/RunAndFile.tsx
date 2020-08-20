import React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { Input, InputGroup, InputGroupAddon, InputProps } from 'reactstrap';

import { latest } from '../api';
import { AppState } from '../model';
import { reportAndSetRunAndFile } from '../thunks';
import { num } from '../util';
import NavButton from './NavButton';

type DispatchProps = {
  onGo: (runno: number, fileno: number) => any;
};

type State = Readonly<Pick<AppState, 'runno' | 'fileno'>>;

// We need to know the hall to fetch the latest run/file when user clicks "LATEST"
type AppStateProps = State & Pick<AppState, 'hall'>;

type Props = AppStateProps & DispatchProps;

class RunAndFileView extends React.Component<Props, State> {
  public readonly state: State = {
    fileno: this.props.fileno,
    runno: this.props.runno,
  };

  // private didClick = false;

  public render() {
    const { runno, fileno } = this.state;

    // let runno: number;
    // let fileno: number;

    // if (this.didClick) {
    //   this.didClick = false;
    //   [runno, fileno] = [this.props.runno, this.props.fileno];
    //   this.setState({ runno, fileno });
    // } else {
    //   [runno, fileno] = [this.state.runno, this.state.fileno];
    // }

    // HACK
    const isSafari = (window as any).safari !== undefined;
    const runInputSize = isSafari ? 6 : 4;
    const fileInputSize = isSafari ? 4 : 2;

    return (
      <div className="form-inline">
        <InputGroup className="mr-2">
          <InputGroupAddon addonType="prepend">Run</InputGroupAddon>
          <Input
            size={num(runInputSize)}
            value={this.fmt(runno)} // cast to string, avoid NaN in input box
            onChange={this.onChangeRunno}
            onKeyUp={this.onKeyUp}
          />
        </InputGroup>
        <InputGroup className="mr-2">
          <InputGroupAddon addonType="prepend">File</InputGroupAddon>
          <Input
            size={num(fileInputSize)}
            value={this.fmt(fileno)}
            onChange={this.onChangeFileno}
            onKeyUp={this.onKeyUp}
          />
        </InputGroup>
        <NavButton
          disabled={runno === this.props.runno && fileno === this.props.fileno}
          onClick={this.onClick}
        >
          GO!
        </NavButton>
        <NavButton className="ml-4" onClick={this.onLatest}>
          LATEST
        </NavButton>
      </div>
    );
  }

  private fmt = (stateVal: number): string =>
    // Added the "stateVal === -1" check to avoid flashing -1 when user clicks "LATEST"
    this.props.runno === -1 || stateVal === -1
      ? 'WAIT'
      : isNaN(stateVal)
        ? ''
        : stateVal.toString();

  private onClick = () => {
    const { onGo } = this.props;
    const { runno, fileno } = this.state;
    // this.didClick = true;
    onGo(runno, fileno);
    // this.forceUpdate();
    // this.setState(this.props);
  };

  private onLatest = async () => {
    this.setState({ runno: -1, fileno: -1 });
    const theLatest = (await latest())[this.props.hall];
    this.setState({ runno: theLatest.runno, fileno: theLatest.fileno });
    this.props.onGo(theLatest.runno, theLatest.fileno);
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

type StateProps = AppStateProps & React.Attributes; // Add "key" attribute

const mapStateToProps: MapStateToProps<StateProps, {}, AppState> = ({
  fileno,
  hall,
  runno,
}) => ({
  fileno,
  hall,
  runno,
  // tslint:disable-next-line:object-literal-sort-keys
  key: `${runno}_${fileno}`, // forces reinitialization when props change
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = {
  onGo: reportAndSetRunAndFile,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RunAndFileView);
