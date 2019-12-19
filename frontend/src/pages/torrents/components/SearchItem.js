import React from "react";
import { Button, ListGroupItem } from "reactstrap";

const SearchItem = ({ item, add }) => {
  return (
    <ListGroupItem className="justify-content-between">
      {item.name} ({item.provider} - {item.size})
      <Button color="success" onClick={() => add(item.magnetUri)}>
        Add
      </Button>
    </ListGroupItem>
  );
};

export default SearchItem;
