import React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';

import { AppState } from '../model';
import { reportAndShiftPage } from '../thunks';
import { FIRST_RUN, Omit } from '../util';
import { ButtonProps, NavButton } from './NavButton';

type AllProps = {
  count: number;
  disabled: boolean;
} & ButtonProps;

type DispatchProps = {
  doShift: (count: number) => any;
};

const ShiftButtonView: React.SFC<AllProps & DispatchProps> = ({
  children,
  count,
  disabled,
  doShift,
  ...btnProps
}) => (
  <NavButton
    children={children}
    disabled={disabled}
    // tslint:disable-next-line:jsx-no-lambda
    onClick={() => doShift(count)}
    {...btnProps}
  />
);

type SubProps = Omit<AllProps, 'count'>;
type StateProps = Pick<SubProps, 'disabled'>;

const PrevButtonView: React.SFC<SubProps & DispatchProps> = ({
  disabled,
  doShift,
  ...btnProps
}) => (
  <ShiftButtonView count={-1} disabled={disabled} doShift={doShift} {...btnProps}>
    PREV
  </ShiftButtonView>
);

const NextButtonView: React.SFC<SubProps & DispatchProps> = ({
  disabled,
  doShift,
  ...btnProps
}) => (
  <ShiftButtonView count={1} disabled={disabled} doShift={doShift} {...btnProps}>
    NEXT
  </ShiftButtonView>
);

const mapStateToPropsPrev: MapStateToProps<StateProps, {}, AppState> = ({
  runno,
  fileno,
  hall,
}) => ({
  disabled: runno === FIRST_RUN[hall] && fileno === 1,
});

const mapStateToPropsNext: MapStateToProps<StateProps, {}, AppState> = ({ atEnd }) => ({
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
