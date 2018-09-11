import React from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';

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
  public readonly state: State = initialState;

  public render() {
    const { items, currentItem, onSelect } = this.props;
    const { dropdownOpen } = this.state;

    return (
      <Dropdown className="d-inline" isOpen={dropdownOpen} toggle={this.toggle}>
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

export default DynamicDropdown;
