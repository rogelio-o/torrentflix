import "./SearchItem.css";

import React from "react";
import { FaCloudDownloadAlt } from "react-icons/fa";
import { Button } from "reactstrap";

const SearchItem = ({ item, add }) => {
  return (
    <div className="torrent-item torrent-item-search">
      <div className="torrent-play">
        <Button
          className="torrent-play-btn"
          onClick={() => add(item.magnetUri)}
        >
          <FaCloudDownloadAlt />
        </Button>
      </div>
      <div className="torrent-data">
        <h3 className="torrent-name">{item.name}</h3>
        <div className="torrent-download-data">
          <span className="download-value">{item.size}</span>
          <span className="download-value">{item.provider}</span>
          <span className="download-value">{item.time}</span>
        </div>
      </div>
    </div>
  );
};

export default SearchItem;
