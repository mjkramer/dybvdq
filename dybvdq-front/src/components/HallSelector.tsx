import React from 'react';
import { Dispatch } from 'redux';
import { connect, MapStateToProps, MapDispatchToProps } from 'react-redux';

import DynamicDropdown, { Props as DDProps } from './DynamicDropdown';
import { setHall } from '../actions';
import { AppState } from '../model';
import { Omit } from '../util';

type Props = Omit<DDProps, 'items'>;

const HallSelector: React.SFC<Props> = ddProps => (
  <DynamicDropdown items={['EH1', 'EH2', 'EH3']} {...ddProps} />
);

type StateProps = Pick<Props, 'currentItem'>;

const mapStateToProps: MapStateToProps<StateProps, {}, AppState> = ({ hall }) => ({
  currentItem: hall,
});

type DispatchProps = Pick<Props, 'onSelect'>;

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = (
  dispatch: Dispatch,
) => ({
  onSelect: newHall => dispatch(setHall(newHall)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(HallSelector);
