import React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';

import { shiftPage as shiftPageA } from '../actions';
import { NavButton } from './NavButton';

type Props = {
  count: number;
  children: React.ReactNode;
};

type DispatchProps = {
  shiftPage: (count: number) => any;
};

const ShiftButton: React.SFC<Props & DispatchProps> = ({
  children,
  count,
  shiftPage,
}) => (
  // tslint:disable-next-line:jsx-no-lambda
  <NavButton children={children} onClick={() => shiftPage(count)} />
);

const mapDispatchToProps: MapDispatchToProps<DispatchProps, Props> = {
  shiftPage: shiftPageA,
};

export default connect(
  null,
  mapDispatchToProps,
)(ShiftButton);
