import React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { DropdownProps } from 'reactstrap';

import { AppState, Hall } from '../model';
import { reportAndSetHall } from '../thunks';
import DynamicDropdown, { Props as DynDDProps } from './DynamicDropdown';

type StateProps = Pick<DynDDProps<Hall>, 'currentItem'>;
type DispatchProps = Pick<DynDDProps<Hall>, 'onSelect'>;
type Props = StateProps & DispatchProps & DropdownProps;

const HallSelectorView: React.SFC<Props> = ({ currentItem, onSelect, ...ddProps }) => (
  <DynamicDropdown
    currentItem={currentItem}
    items={['EH1', 'EH2', 'EH3']}
    onSelect={onSelect}
    {...ddProps}
  />
);

const mapStateToProps: MapStateToProps<StateProps, {}, AppState> = ({ hall }) => ({
  currentItem: hall,
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = {
  onSelect: reportAndSetHall,
};

export const foo: DispatchProps = {
  onSelect: reportAndSetHall,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(HallSelectorView);
