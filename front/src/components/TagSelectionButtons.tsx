import React, { Fragment } from 'react';
import { connect, MapStateToProps } from 'react-redux';

import { plzTagSelection, plzUntagSelection } from '../events';
import { AppState } from '../model';
import NavButton from './NavButton';

type Props = Pick<AppState, 'selectionActive' | 'selectionType'>;

const onClickTag = () => plzTagSelection.next();
const onClickUntag = () => plzUntagSelection.next();

const TagSelectionButtonsView: React.SFC<Props> = ({
  selectionActive,
  selectionType,
}) => (
  <Fragment>
    <NavButton
      disabled={!selectionActive || selectionType === 'AllGood'}
      onClick={onClickUntag}
      className="mr-4"
    >
      UNTAG SEL
    </NavButton>

    <NavButton
      disabled={!selectionActive || selectionType === 'AllBad'}
      onClick={onClickTag}
    >
      TAG SEL
    </NavButton>
  </Fragment>
);

const mapStateToProps: MapStateToProps<Props, {}, AppState> = ({
  selectionActive,
  selectionType,
}) => ({
  selectionActive,
  selectionType,
});

export default connect(mapStateToProps)(TagSelectionButtonsView);
