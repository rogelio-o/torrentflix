import React from "react";
import { ListGroup } from "reactstrap";

import SearchItem from "./SearchItem";

const SearchItems = ({ items, add }) => {
  return (
    <ListGroup>
      {items.map((item) => (
        <SearchItem item={item} add={add} />
      ))}
    </ListGroup>
  );
};

export default SearchItems;
