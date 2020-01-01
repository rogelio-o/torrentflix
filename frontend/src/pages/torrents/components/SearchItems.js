import React from "react";

import SearchItem from "./SearchItem";

const SearchItems = ({ items, add }) => {
  return (
    <div className="torrents-search-list">
      {items.map((item) => (
        <SearchItem item={item} add={add} />
      ))}
    </div>
  );
};

export default SearchItems;
