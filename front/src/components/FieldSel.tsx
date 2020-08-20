import axios from 'axios';
import { find } from 'lodash';
import React, { Fragment } from 'react';
import { connect, DispatchProp, MapDispatchToProps, MapStateToProps } from 'react-redux';
import Select from 'react-select';
import { ValueType as SelectValueType } from 'react-select/lib/types';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { setFields } from '../actions';
import { AppState, Field } from '../model';
import { initLocation, reportAndSetFields } from '../thunks';
import { DEFAULT_FIELD } from '../util';
import NavButton from './NavButton';

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
    if (this.props.fields.length === 0) {
      const defaultField = find(allFields, { value: DEFAULT_FIELD });
      this.props.dispatch(setFields([defaultField]));
    }
    (this.props.dispatch as any)(initLocation());
  }

  public render() {
    const { fields, onChange } = this.props;
    const { allFields } = this.state;

    if (!allFields) {
      return <span>Loading...</span>;
    }

    return (
      <Fragment>
        <div style={{ flexGrow: 1 }}>
          <Select
            inputId="fieldSel"
            isMulti={true}
            options={allFields}
            value={fields}
            onChange={onChange}
          />
        </div>
        <NavButton
          className="ml-4"
          disabled={fields.length === 0}
          onClick={this.onClear}
        >
          CLEAR PLOTS
        </NavButton>
        <NavButton className="ml-4" disabled={fields === allFields} onClick={this.onAll}>
          ALL PLOTS
        </NavButton>
      </Fragment>
    );
  }

  private onClear = () => {
    this.props.onChange([]);
  };

  private onAll = () => {
    this.props.onChange(this.state.allFields);
  };
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
