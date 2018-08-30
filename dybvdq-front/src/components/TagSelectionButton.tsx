import React from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';

import { tagSelection } from '../actions';
import { IAppState } from '../model';
import NavButton, { IProps as ButtonProps } from './NavButton';

const View: React.SFC<ButtonProps> = btnProps => (
  <NavButton {...btnProps}>TAG SEL</NavButton>
);

const mapStateToProps: MapStateToProps<ButtonProps, {}, IAppState> = ({
  selectionActive,
}) => ({
  disabled: !selectionActive,
});

const mapDispatchToProps: MapDispatchToProps<ButtonProps, {}> = {
  onClick: tagSelection,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(View);
