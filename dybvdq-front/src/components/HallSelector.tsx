import React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import { Dispatch } from 'redux';

import { setHall } from '../actions';
import { AppState } from '../model';
import { Omit } from '../util';
import DynamicDropdown, { IProps as DDProps } from './DynamicDropdown';

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
