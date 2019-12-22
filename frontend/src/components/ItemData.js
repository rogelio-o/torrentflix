import React from "react";

const ItemData = ({ title, description }) => {
  return (
    <div className="item-info">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
};

export default ItemData;
