import React from "react";
import { ListGroup } from "reactstrap";

import Item from "./Item";

const Items = ({ items }) => {
  return (
    <ListGroup>
      {items.map((item) => (
        <Item item={item} />
      ))}
    </ListGroup>
  );
};

export default Items;
