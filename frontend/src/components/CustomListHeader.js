import "./CustomListHeader.css";

import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Button, Input, InputGroup, InputGroupAddon } from "reactstrap";

const CustomListHeader = ({ onSearchChange, children, defaultSearchValue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div className={"items-list-header" + (isOpen ? " open" : "")}>
      <InputGroup>
        <Input
          placeholder="Search..."
          onChange={onSearchChange}
          defaultValue={defaultSearchValue || ""}
        />
        <InputGroupAddon addonType="append">
          <Button onClick={toggle}>
            <FaSearch />
          </Button>
        </InputGroupAddon>
        {children}
      </InputGroup>
    </div>
  );
};

export default CustomListHeader;
