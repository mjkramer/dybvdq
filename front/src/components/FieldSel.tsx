import axios from 'axios';
import React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import Select from 'react-select';
import { Props as SelectProps } from 'react-select/lib/Select';

import { setFields } from '../actions';
import { AppState, Field } from '../model';

type Props = {
  fields: Field[];
  onChange: SelectProps<Field>['onChange'];
};

const initialState = {
  allFields: [] as Field[],
};

type State = Readonly<typeof initialState>;

class FieldSel extends React.Component<Props, State> {
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
    const { fields, onChange } = this.props;
    const { allFields } = this.state;

    if (!allFields) {
      return <span>Loading...</span>;
    }

    return (
      <Select isMulti={true} options={allFields} value={fields} onChange={onChange} />
    );
  }
}

type StateProps = Pick<Props, 'fields'>;
const mapStateToProps: MapStateToProps<StateProps, {}, AppState> = ({ fields }) => ({
  fields,
});

type DispatchProps = Pick<Props, 'onChange'>;
const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = {
  onChange: setFields,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(FieldSel);
