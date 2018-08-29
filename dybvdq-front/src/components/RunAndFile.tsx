import React from 'react';
import { connect, DispatchProp, MapStateToProps } from 'react-redux';
import { Input, InputGroup, InputGroupAddon, InputProps } from 'reactstrap';

import NavButton, { Props as ButtonProps } from './NavButton';
import { setRunAndFile } from '../actions';
import { AppState } from '../model';

type ViewProps = {
  runno: number;
  fileno: number;
  onChangeRunno: InputProps['onChange'],
  onChangeFileno: InputProps['onChange'],
  onClick: ButtonProps['onClick'],
};

const View: React.SFC<ViewProps> = (props) => (
  <div className="form-inline">
    <InputGroup className="mr-2">
      <InputGroupAddon addonType="prepend">
        Run
      </InputGroupAddon>
      <Input size={4} value={props.runno} onChange={props.onChangeRunno} />
    </InputGroup>
    <InputGroup className="mr-2">
      <InputGroupAddon addonType="prepend">
        File
      </InputGroupAddon>
      <Input size={3} value={props.fileno} onChange={props.onChangeFileno} />
    </InputGroup>
    <NavButton onClick={props.onClick}>
      GO!
    </NavButton>
  </div>
);

type State = Readonly<Pick<ViewProps, 'runno' | 'fileno'>>;

class RunAndFile extends React.Component<State & DispatchProp, State> {
  readonly state: State = this.props;
  
  onClick = () => {
    const { dispatch } = this.props;
    const { runno, fileno } = this.state;
    dispatch(setRunAndFile(runno, fileno));
  }

  onChangeRunno: ViewProps['onChangeRunno'] = (e) => {
    this.setState({runno: parseInt(e.target.value, 10)});
  }

  onChangeFileno: ViewProps['onChangeFileno'] = (e) => {
    this.setState({fileno: parseInt(e.target.value, 10)});
  }

  render() {
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
}

type StateProps = State & React.Attributes; // Add "key" attribute

const mapStateToProps: MapStateToProps<StateProps, {}, AppState> = ({ runno, fileno }) => ({
  runno: runno,
  fileno: fileno,
  key: `${runno}_${fileno}`, // forces reinitialization when props change
});

export default connect(mapStateToProps)(RunAndFile);