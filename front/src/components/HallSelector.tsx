import React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';

import { setHall } from '../actions';
import { AppState } from '../model';
import DynamicDropdown, { Props as DDProps } from './DynamicDropdown';

type StateProps = Pick<DDProps, 'currentItem'>;
type DispatchProps = Pick<DDProps, 'onSelect'>;
type Props = StateProps & DispatchProps;

const HallSelectorView: React.SFC<Props> = ({ currentItem, onSelect }) => (
  <DynamicDropdown
    currentItem={currentItem}
    items={['EH1', 'EH2', 'EH3']}
    onSelect={onSelect}
  />
);

const mapStateToProps: MapStateToProps<StateProps, {}, AppState> = ({ hall }) => ({
  currentItem: hall,
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = {
  onSelect: setHall,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(HallSelectorView);
