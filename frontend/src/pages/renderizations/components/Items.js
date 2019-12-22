import React from "react";
import { ListGroup } from "reactstrap";

import Item from "./Item";

const Items = ({ items, stop, pause, play, seek }) => {
  return (
    <ListGroup>
      {items.map((item) => (
        <Item
          item={item}
          stop={stop.bind(this)}
          pause={pause.bind(this)}
          play={play.bind(this)}
          seek={seek.bind(this)}
        />
      ))}
    </ListGroup>
  );
};

export default Items;
