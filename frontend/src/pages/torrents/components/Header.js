import React from "react";
import { Button, Input, InputGroup, InputGroupAddon } from "reactstrap";

const Header = ({ searchValue, onSearchChange, onAddClick }) => {
  return (
    <InputGroup>
      <Input onChange={onSearchChange} value={searchValue} />
      <InputGroupAddon addonType="append">
        <Button onClick={onAddClick} color="success">
          Add from magnet
        </Button>
      </InputGroupAddon>
    </InputGroup>
  );
};

export default Header;
