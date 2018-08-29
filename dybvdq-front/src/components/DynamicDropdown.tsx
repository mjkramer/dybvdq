import React from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

export type Props = {
  items: string[];
  currentItem: string;
  onSelect: (item: string) => any;
};

const initialState = {
  dropdownOpen: false,
};

type State = Readonly<typeof initialState>;

class DynamicDropdown extends React.Component<Props, State> {
  readonly state: State = initialState;

  toggle = () => {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen,
    }));
  };

  render() {
    const { items, currentItem, onSelect } = this.props;
    const { dropdownOpen } = this.state;

    return (
      <Dropdown className="d-inline" isOpen={dropdownOpen} toggle={this.toggle}>
        <DropdownToggle color="primary" outline caret>
          {currentItem}
        </DropdownToggle>
        <DropdownMenu>
          {items.map(item => {
            const active = item === currentItem;
            return (
              <DropdownItem key={item} active={active} onClick={() => onSelect(item)}>
                {item}
              </DropdownItem>
            );
          })}
        </DropdownMenu>
      </Dropdown>
    );
  }
}

export default DynamicDropdown;
