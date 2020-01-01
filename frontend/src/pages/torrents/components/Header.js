import React, { useState } from "react";
import { FaLink, FaPlus } from "react-icons/fa";
import { DropdownItem, DropdownMenu, DropdownToggle, InputGroupButtonDropdown } from "reactstrap";

import CustomListHeader from "../../../components/CustomListHeader";

const Header = ({ searchValue, onSearchChange, onAddClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <CustomListHeader
      onSearchChange={onSearchChange}
      defaultSearchValue={searchValue}
    >
      <InputGroupButtonDropdown
        addonType="append"
        isOpen={isOpen}
        toggle={toggle}
      >
        <DropdownToggle>
          <FaPlus />
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem onClick={onAddClick}>
            <FaLink />
            Magnet URI
          </DropdownItem>
        </DropdownMenu>
      </InputGroupButtonDropdown>
    </CustomListHeader>
  );
};

export default Header;
