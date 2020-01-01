import React from "react";

import Item from "./Item";

const Items = ({ items, stop, pause, play, seek }) => {
  return (
    <div className="renderizations-list">
      {items.map((item) => (
        <Item
          item={item}
          stop={stop.bind(this)}
          pause={pause.bind(this)}
          play={play.bind(this)}
          seek={seek.bind(this)}
        />
      ))}
    </div>
  );
};

export default Items;
