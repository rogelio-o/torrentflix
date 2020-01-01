import "./BaseItemsList.css";

import React from "react";

const BaseItemsList = ({ items, itemRenderer }) => {
  return (
    <div className="items-list">
      {items.map((item, index) => (
        <div className="item-wrapper" key={index}>
          {itemRenderer(item)}
        </div>
      ))}
    </div>
  );
};

export default BaseItemsList;
