import React from 'react';
import { connect, MapStateToProps } from 'react-redux';

import { plzTagSelection } from '../events';
import { AppState } from '../model';
import NavButton, { Props as ButtonProps } from './NavButton';

const onClick = () => plzTagSelection.next();

const TagSelectionButton: React.SFC<ButtonProps> = btnProps => (
  <NavButton onClick={onClick} {...btnProps}>
    TAG SEL
  </NavButton>
);

const mapStateToProps: MapStateToProps<ButtonProps, {}, AppState> = ({
  selectionActive,
}) => ({
  disabled: !selectionActive,
});

export default connect(mapStateToProps)(TagSelectionButton);
