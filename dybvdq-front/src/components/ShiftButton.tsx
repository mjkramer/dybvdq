import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import NavButton from './NavButton';
import { shiftPage } from '../actions';

type Props = {
  count: number;
};

const ShiftButton: React.SFC<Props> = ({ count: _, ...btnProps }) => (
  <NavButton {...btnProps} />
);

const mapDispatchToProps = (dispatch: Dispatch, { count }: Props) => {
  onClick: {
    () => dispatch(shiftPage(count));
  }
};

export default connect(
  null,
  mapDispatchToProps,
)(ShiftButton);
