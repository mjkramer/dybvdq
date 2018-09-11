import React from 'react';
import { connect, DispatchProp, MapStateToProps } from 'react-redux';
import { Input, InputGroup, InputGroupAddon, InputProps } from 'reactstrap';

import { setRunAndFile } from '../actions';
import { AppState } from '../model';
import { num } from '../util';
import NavButton, { Props as ButtonProps } from './NavButton';

type ViewProps = {
  runno: number;
  fileno: number;
  onChangeRunno: InputProps['onChange'];
  onChangeFileno: InputProps['onChange'];
  onClick: ButtonProps['onClick'];
};

const View: React.SFC<ViewProps> = props => (
  <div className="form-inline">
    <InputGroup className="mr-2">
      <InputGroupAddon addonType="prepend">Run</InputGroupAddon>
      <Input size={num(4)} value={props.runno} onChange={props.onChangeRunno} />
    </InputGroup>
    <InputGroup className="mr-2">
      <InputGroupAddon addonType="prepend">File</InputGroupAddon>
      <Input size={num(3)} value={props.fileno} onChange={props.onChangeFileno} />
    </InputGroup>
    <NavButton onClick={props.onClick}>GO!</NavButton>
  </div>
);

type State = Readonly<Pick<ViewProps, 'runno' | 'fileno'>>;

class RunAndFileView extends React.Component<State & DispatchProp, State> {
  public readonly state: State = {
    fileno: this.props.fileno,
    runno: this.props.runno,
  };

  public render() {
    const { runno, fileno } = this.state;
    return (
      <View
        runno={runno}
        fileno={fileno}
        onClick={this.onClick}
        onChangeRunno={this.onChangeRunno}
        onChangeFileno={this.onChangeFileno}
      />
    );
  }

  private onClick = () => {
    const { dispatch } = this.props;
    const { runno, fileno } = this.state;
    dispatch(setRunAndFile(runno, fileno));
  };

  private onChangeRunno: ViewProps['onChangeRunno'] = e => {
    this.setState({ runno: parseInt(e.target.value, 10) });
  };

  private onChangeFileno: ViewProps['onChangeFileno'] = e => {
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

export default connect(mapStateToProps)(RunAndFileView);
