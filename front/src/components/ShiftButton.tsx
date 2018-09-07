import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { shiftPage } from '../actions';
import NavButton from './NavButton';

interface IProps {
  count: number;
}

const ShiftButton: React.SFC<IProps> = ({ count: _, ...btnProps }) => (
  <NavButton {...btnProps} />
);

const mapDispatchToProps = (dispatch: Dispatch, { count }: IProps) => ({
  onClick: () => dispatch(shiftPage(count)),
});

export default connect(
  null,
  mapDispatchToProps,
)(ShiftButton);
