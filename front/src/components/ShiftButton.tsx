import React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { Dispatch } from 'redux';

import { shiftPage } from '../actions';
import { NavButton, Props as ButtonProps } from './NavButton';

type Props = {
  count: number;
  children: React.ReactNode;
};

type DispatchProps = {
  onClick: ButtonProps['onClick'];
};

const ShiftButton: React.SFC<Props & DispatchProps> = ({ children, onClick }) => (
  <NavButton children={children} onClick={onClick} />
);

const mapDispatchToProps: MapDispatchToProps<DispatchProps, Props> = (
  dispatch: Dispatch,
  { count }: Props,
) => ({
  onClick: () => dispatch(shiftPage(count)),
});

export default connect(
  null,
  mapDispatchToProps,
)(ShiftButton);
