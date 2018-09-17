import axios from 'axios';
import { find } from 'lodash';
import React from 'react';
import { connect, DispatchProp, MapDispatchToProps, MapStateToProps } from 'react-redux';
import Select from 'react-select';
import { ValueType as SelectValueType } from 'react-select/lib/types';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { setFields } from '../actions';
import { AppState, Field } from '../model';
import { initLocation, reportAndSetFields } from '../thunks';
import { DEFAULT_FIELD } from '../util';

type Props = {
  fields: Field[];
  onChange: (fields: SelectValueType<Field>) => void;
};

const initialState = {
  allFields: [] as Field[],
};

type State = Readonly<typeof initialState>;

class FieldSelView extends React.Component<Props & DispatchProp, State> {
  public readonly state: State = initialState;

  public async componentDidMount() {
    const { data } = await axios.get('/list_fields');
    const allFields = Object.entries(data).map(([k, v]) => ({
      label: v as string,
      value: k,
    }));
    // const allFields = Object.keys(data).map(k => ({,
    //   label: data[k],,
    //   value: k,,
    // }));,
    this.setState({ allFields });
    const defaultField = find(allFields, { value: DEFAULT_FIELD });
    this.props.dispatch(setFields([defaultField]));
    (this.props.dispatch as any)(initLocation());
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
const mapDispatchToProps: MapDispatchToProps<
  DispatchProps & DispatchProp,
  {}
> = dispatch => ({
  dispatch,
  onChange: fields => {
    (dispatch as ThunkDispatch<AppState, void, Action>)(reportAndSetFields(fields));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(FieldSelView);
