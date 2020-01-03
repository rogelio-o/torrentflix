import React from "react";
import { FaPlus } from "react-icons/fa";
import { Button, InputGroupAddon } from "reactstrap";

import CustomListHeader from "./CustomListHeader";

const ItemsListHeader = ({ onSearchChange, onAddClick }) => {
  return (
    <CustomListHeader onSearchChange={onSearchChange}>
      <InputGroupAddon addonType="append">
        <Button onClick={onAddClick}>
          <FaPlus />
        </Button>
      </InputGroupAddon>
    </CustomListHeader>
  );
};

export default ItemsListHeader;
