import React from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownProps,
  DropdownToggle,
} from 'reactstrap';

import { Omit } from '../util';

export type Props<T extends string> = {
  items: T[];
  currentItem: T;
  onSelect: (item: T) => any;
} & Omit<DropdownProps, 'onSelect'>;

const initialState = {
  dropdownOpen: false,
};

type State = Readonly<typeof initialState>;

class DynamicDropdown<T extends string> extends React.Component<Props<T>, State> {
  public readonly state: State = initialState;

  public render() {
    const { items, currentItem, onSelect, ...ddProps } = this.props;
    const { dropdownOpen } = this.state;

    return (
      <Dropdown
        className="d-inline"
        isOpen={dropdownOpen}
        toggle={this.toggle}
        {...ddProps}
      >
        <DropdownToggle color="primary" outline={true} caret={true}>
          {currentItem}
        </DropdownToggle>
        <DropdownMenu>
          {items.map(item => {
            const active = item === currentItem;
            return (
              // tslint:disable-next-line:jsx-no-lambda
              <DropdownItem key={item} active={active} onClick={() => onSelect(item)}>
                {item}
              </DropdownItem>
            );
          })}
        </DropdownMenu>
      </Dropdown>
    );
  }

  private toggle = () => {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen,
    }));
  };
}

export const foo: Props<string> = {
  className: 'mr-4',
  currentItem: '3',
  items: ['3'],
  onSelect: () => {
    return 42;
  },
};

export default DynamicDropdown;
