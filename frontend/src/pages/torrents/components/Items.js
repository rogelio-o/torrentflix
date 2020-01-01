import React from "react";

import Item from "./Item";

const Items = ({ items, openModal, openCopyModal, remove }) => {
  return (
    <div className="torrents-list">
      {items.map((item, index) => (
        <Item
          item={item}
          openModal={openModal}
          openCopyModal={openCopyModal}
          remove={remove}
          key={index}
        />
      ))}
    </div>
  );
};

export default Items;
