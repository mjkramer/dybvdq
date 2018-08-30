import React from 'react';
import { connect, DispatchProp, MapStateToProps } from 'react-redux';
import { Input, InputGroup, InputGroupAddon, InputProps } from 'reactstrap';

import { setRunAndFile } from '../actions';
import { IAppState } from '../model';
import NavButton, { IProps as ButtonProps } from './NavButton';

interface IViewProps {
  runno: number;
  fileno: number;
  onChangeRunno: InputProps['onChange'];
  onChangeFileno: InputProps['onChange'];
  onClick: ButtonProps['onClick'];
}

const View: React.SFC<IViewProps> = props => (
  <div className="form-inline">
    <InputGroup className="mr-2">
      <InputGroupAddon addonType="prepend">Run</InputGroupAddon>
      <Input size={4} value={props.runno} onChange={props.onChangeRunno} />
    </InputGroup>
    <InputGroup className="mr-2">
      <InputGroupAddon addonType="prepend">File</InputGroupAddon>
      <Input size={3} value={props.fileno} onChange={props.onChangeFileno} />
    </InputGroup>
    <NavButton onClick={props.onClick}>GO!</NavButton>
  </div>
);

type State = Readonly<Pick<IViewProps, 'runno' | 'fileno'>>;

class RunAndFile extends React.Component<State & DispatchProp, State> {
  public readonly state: State = this.props;

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

  private onChangeRunno: IViewProps['onChangeRunno'] = e => {
    this.setState({ runno: parseInt(e.target.value, 10) });
  };

  private onChangeFileno: IViewProps['onChangeFileno'] = e => {
    this.setState({ fileno: parseInt(e.target.value, 10) });
  };
}

type StateProps = State & React.Attributes; // Add "key" attribute

const mapStateToProps: MapStateToProps<StateProps, {}, IAppState> = ({
  fileno,
  runno,
}) => ({
  fileno,
  runno,
  // tslint:disable-next-line:object-literal-sort-keys
  key: `${runno}_${fileno}`, // forces reinitialization when props change
});

export default connect(mapStateToProps)(RunAndFile);
