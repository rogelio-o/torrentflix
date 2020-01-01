import React from "react";

import BaseItemsList from "./BaseItemsList";
import ListItem from "./ListItem";

const ItemsList = ({ items }) => {
  return (
    <BaseItemsList
      items={items}
      itemRenderer={(item) => <ListItem item={item} />}
    />
  );
};

export default ItemsList;
