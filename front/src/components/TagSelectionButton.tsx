import React from 'react';
import { connect, MapStateToProps } from 'react-redux';

import { plzTagSelection } from '../events';
import { AppState } from '../model';
import NavButton, { Props as ButtonProps } from './NavButton';

type Props = { verb: string } & Pick<ButtonProps, 'disabled'>;

const onClick = () => plzTagSelection.next();

const TagSelectionButtonView: React.SFC<Props> = ({ disabled, verb }) => (
  <NavButton disabled={disabled} onClick={onClick}>
    {verb} SEL
  </NavButton>
);

const mapStateToProps: MapStateToProps<Props, {}, AppState> = ({
  selectionActive,
  selectionAllTagged,
}) => ({
  disabled: !selectionActive,
  verb: selectionAllTagged ? 'UNTAG' : 'TAG',
});

export default connect(mapStateToProps)(TagSelectionButtonView);
