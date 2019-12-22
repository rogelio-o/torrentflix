import React from "react";

const ItemAttributes = ({ attributes }) => {
  return (
    <ul className="item-properties">
      {attributes.map((attribute) => (
        <li>
          <strong>{attribute.label}:</strong> {attribute.value}
        </li>
      ))}
    </ul>
  );
};

export default ItemAttributes;
