import React from 'react';
import { connect, MapStateToProps } from 'react-redux';

import { plzTagSelection } from '../events';
import { AppState } from '../model';
import NavButton, { Props as ButtonProps } from './NavButton';

type Props = Pick<ButtonProps, 'disabled'>;

const onClick = () => plzTagSelection.next();

const TagSelectionButtonView: React.SFC<Props> = ({ disabled }) => (
  <NavButton disabled={disabled} onClick={onClick}>
    TAG SEL
  </NavButton>
);

const mapStateToProps: MapStateToProps<Props, {}, AppState> = ({ selectionActive }) => ({
  disabled: !selectionActive,
});

export default connect(mapStateToProps)(TagSelectionButtonView);
