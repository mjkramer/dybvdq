import React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';

import { doShiftPage } from '../thunks';
import { NavButton } from './NavButton';

type Props = {
  count: number;
  children: React.ReactNode;
};

type DispatchProps = {
  doShift: (count: number) => any;
};

const ShiftButtonView: React.SFC<Props & DispatchProps> = ({
  children,
  count,
  doShift,
}) => (
  // tslint:disable-next-line:jsx-no-lambda
  <NavButton children={children} onClick={() => doShift(count)} />
);

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = {
  doShift: doShiftPage,
};

export default connect(
  null,
  mapDispatchToProps,
)(ShiftButtonView);
