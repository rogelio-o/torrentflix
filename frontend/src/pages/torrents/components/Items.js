import React from "react";
import { ListGroup } from "reactstrap";

import Item from "./Item";

const Items = ({ items, openModal, openCopyModal, remove }) => {
  return (
    <ListGroup>
      {items.map((item) => (
        <Item
          item={item}
          openModal={openModal}
          openCopyModal={openCopyModal}
          remove={remove}
        />
      ))}
    </ListGroup>
  );
};

export default Items;
