import axios from 'axios';
import React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import Select from 'react-select';
import { ValueType as SelectValueType } from 'react-select/lib/types';

import { setSession } from '../actions';
import { AppState } from '../model';

type StateProps = Readonly<Pick<AppState, 'session'>>;

type DispatchProps = {
  onChange: (session: SelectValueType<string>) => void;
};

type Props = StateProps & DispatchProps;

type State = {
  allSessions: string[];
};

class SessionFormView extends React.Component<Props, State> {
  public readonly state: State = {
    allSessions: [],
  };

  public async componentDidMount() {
    const { data } = await axios.get('/list_sessions');
    this.setState({ allSessions: data });
  }

  public render() {
    const { session, onChange } = this.props;
    const { allSessions } = this.state;

    if (!allSessions) {
      return <span>Loading...</span>;
    }

    const options = allSessions.map(s => ({ label: s, value: s }));

    return (
      <Select
        options={(options as unknown) as string[]}
        value={{ label: session, value: session } as any}
        onChange={onChange}
      />
    );
  }
}

const mapStateToProps: MapStateToProps<StateProps, {}, AppState> = ({ session }) => ({
  session,
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = {
  onChange: s => setSession((s as any).value),
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SessionFormView);
