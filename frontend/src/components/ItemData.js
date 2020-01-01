import "./ItemData.css";

import React from "react";

const ItemData = ({ title, description }) => {
  return (
    <div className="item-view-data">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
};

export default ItemData;
