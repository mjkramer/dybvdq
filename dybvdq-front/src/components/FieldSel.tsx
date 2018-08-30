import axios from 'axios';
import React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import Select from 'react-select';
import { Props as SelectProps } from 'react-select/lib/Select';

import { setFields } from '../actions';
import { IAppState, IField } from '../model';

interface IProps {
  selectedFields: IField[];
  onChange: SelectProps<IField>['onChange'];
}

const initialState = {
  allFields: [] as IField[],
};

type State = Readonly<typeof initialState>;

class FieldSel extends React.Component<IProps, State> {
  public readonly state: State = initialState;

  public async componentDidMount() {
    const { data } = await axios.get('/list_fields');
    const allFields = Object.keys(data).map(k => ({
      label: data[k],
      value: k,
    }));
    this.setState({ allFields });
  }

  public render() {
    const { selectedFields, onChange } = this.props;
    const { allFields } = this.state;

    if (!allFields) {
      return <span>Loading...</span>;
    }

    return (
      <Select
        isMulti={true}
        options={allFields}
        // value={this.objifyValues(values)}
        value={selectedFields}
        onChange={onChange}
      />
    );
  }
}

type StateProps = Pick<IProps, 'selectedFields'>;
const mapStateToProps: MapStateToProps<StateProps, {}, IAppState> = ({
  selectedFields,
}) => ({ selectedFields });

type DispatchProps = Pick<IProps, 'onChange'>;
const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = {
  onChange: setFields,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(FieldSel);
