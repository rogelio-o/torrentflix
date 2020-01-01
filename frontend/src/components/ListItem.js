import "./ListItem.css";

import React, { useState } from "react";
import { FaEllipsisV } from "react-icons/fa";
import { Link } from "react-router-dom";
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";

import BaseItem from "./BaseItem";

const ItemList = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <BaseItem
      item={item}
      dataRenderer={(data) => (
        <Link to={item.link} className="item-data">
          {data}
        </Link>
      )}
    >
      <ButtonDropdown isOpen={isOpen} toggle={toggle}>
        <DropdownToggle>
          <FaEllipsisV />
        </DropdownToggle>
        <DropdownMenu>
          {item.buttons.map((button, index) => {
            const Icon = button.icon ? button.icon : null;
            return (
              <DropdownItem key={index} onClick={button.onClick}>
                {Icon ? <Icon /> : null}
                {button.text}
              </DropdownItem>
            );
          })}
        </DropdownMenu>
      </ButtonDropdown>
    </BaseItem>
  );
};

export default ItemList;
