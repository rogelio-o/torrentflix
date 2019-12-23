import React from "react";
import { Button, Input, InputGroup, InputGroupAddon } from "reactstrap";

const ItemsListHeader = ({ onSearchChange, onAddClick }) => {
  return (
    <InputGroup>
      <Input onChange={onSearchChange} />
      <InputGroupAddon addonType="append">
        <Button onClick={onAddClick} color="success">
          Create
        </Button>
      </InputGroupAddon>
    </InputGroup>
  );
};

export default ItemsListHeader;
