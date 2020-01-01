import "./BaseItem.css";

import React from "react";

const BaseItem = ({ item, children, dataRenderer }) => {
  return (
    <div className="item" style={{ backgroundImage: `url(${item.poster})` }}>
      {children}
      {dataRenderer(
        <div className="item-data-inner">
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </div>,
      )}
    </div>
  );
};

export default BaseItem;
