import "./ItemAttributes.css";

import React from "react";

const ItemAttributes = ({ attributes }) => {
  return (
    <ul className="item-attributes">
      {attributes.map((attribute, index) => (
        <li key={index}>
          <p className="label">{attribute.label}:</p>
          <p className="value">{attribute.value}</p>
        </li>
      ))}
    </ul>
  );
};

export default ItemAttributes;
