import React from "react";
import { ListGroup } from "reactstrap";

import Item from "./Item";

const Items = ({ items, openModal, remove }) => {
  return (
    <ListGroup>
      {items.map((item) => (
        <Item item={item} openModal={openModal} remove={remove} />
      ))}
    </ListGroup>
  );
};

export default Items;
