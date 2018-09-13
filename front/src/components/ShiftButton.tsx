import React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';

import { AppState } from '../model';
import { reportAndShiftPage } from '../thunks';
import { FIRST_RUN } from '../util';
import { NavButton } from './NavButton';

type AllProps = {
  count: number;
  disabled: boolean;
};

type DispatchProps = {
  doShift: (count: number) => any;
};

const ShiftButtonView: React.SFC<AllProps & DispatchProps> = ({
  children,
  count,
  disabled,
  doShift,
}) => (
  // tslint:disable-next-line:jsx-no-lambda
  <NavButton children={children} disabled={disabled} onClick={() => doShift(count)} />
);

type SubProps = Pick<AllProps, 'disabled'>;

const PrevButtonView: React.SFC<SubProps & DispatchProps> = ({ disabled, doShift }) => (
  <ShiftButtonView count={-1} disabled={disabled} doShift={doShift}>
    PREV
  </ShiftButtonView>
);

const NextButtonView: React.SFC<SubProps & DispatchProps> = ({ disabled, doShift }) => (
  <ShiftButtonView count={1} disabled={disabled} doShift={doShift}>
    NEXT
  </ShiftButtonView>
);

const mapStateToPropsPrev: MapStateToProps<SubProps, {}, AppState> = ({
  runno,
  fileno,
  hall,
}) => ({
  disabled: runno === FIRST_RUN[hall] && fileno === 1,
});

const mapStateToPropsNext: MapStateToProps<SubProps, {}, AppState> = ({ atEnd }) => ({
  disabled: atEnd,
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = {
  doShift: reportAndShiftPage,
};

export const PrevButton = connect(
  mapStateToPropsPrev,
  mapDispatchToProps,
)(PrevButtonView);

export const NextButton = connect(
  mapStateToPropsNext,
  mapDispatchToProps,
)(NextButtonView);
