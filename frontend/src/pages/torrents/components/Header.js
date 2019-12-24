import React, { useState } from "react";
import { DropdownItem, DropdownMenu, DropdownToggle, Input, InputGroup, InputGroupButtonDropdown } from "reactstrap";

const Header = ({ searchValue, onSearchChange, onAddClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <InputGroup>
      <Input
        onChange={onSearchChange}
        value={searchValue}
        placeholder="Search torrent..."
      />
      <InputGroupButtonDropdown
        addonType="append"
        isOpen={isOpen}
        toggle={toggle}
      >
        <DropdownToggle caret>Add from</DropdownToggle>
        <DropdownMenu>
          <DropdownItem onClick={onAddClick}>Magnet URI</DropdownItem>
        </DropdownMenu>
      </InputGroupButtonDropdown>
    </InputGroup>
  );
};

export default Header;
