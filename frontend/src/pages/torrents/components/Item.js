import "./Item.css";

import React, { useState } from "react";
import { FaCloudDownloadAlt, FaCloudUploadAlt, FaEllipsisV, FaLink, FaPlay, FaTimes } from "react-icons/fa";
import { Button, ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle, Progress } from "reactstrap";

const wrapParsedSize = (num, suffix) => {
  return (
    <span>
      <span className="number">{num.toFixed(2)}</span>
      <span className="suffix">{suffix}</span>
    </span>
  );
};

const parseSize = (bytes, suffix = "") => {
  const kBytes = bytes / 1024;
  if (Math.floor(kBytes) === 0) {
    return wrapParsedSize(bytes, "b" + suffix);
  }

  const mBytes = kBytes / 1024;
  if (Math.floor(mBytes) === 0) {
    return wrapParsedSize(kBytes, "Kb" + suffix);
  }

  const gBytes = mBytes / 1024;
  if (Math.floor(gBytes) === 0) {
    return wrapParsedSize(mBytes, "Mb" + suffix);
  }

  return wrapParsedSize(gBytes, "Gb" + suffix);
};

const Items = ({ item, openModal, remove, openCopyModal }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  return (
    <div className="torrent-item">
      <ButtonDropdown
        isOpen={isOpen}
        toggle={toggle}
        className="torrent-actions"
      >
        <DropdownToggle>
          <FaEllipsisV />
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem onClick={() => openCopyModal(item)}>
            <FaLink /> Copy URL
          </DropdownItem>
          <DropdownItem onClick={() => remove(item.id)}>
            <FaTimes /> Remove
          </DropdownItem>
        </DropdownMenu>
      </ButtonDropdown>
      <div className="torrent-play">
        <Button className="torrent-play-btn" onClick={() => openModal(item)}>
          <FaPlay />
        </Button>
      </div>
      <div className="torrent-data">
        <h2 className="torrent-name">{item.name}</h2>
        <div className="torrent-download-data">
          <span className="download-value download">
            <FaCloudDownloadAlt />
            {parseSize(item.downloadSpeed, "/s")}
          </span>
          <span className="download-value upload">
            <FaCloudUploadAlt />
            {parseSize(item.uploadSpeed, "/s")}
          </span>
          <span className="download-value">{parseSize(item.size)}</span>
          <span className="download-value">
            <span className="number">{item.numPeers}</span>
            <span className="suffix">peers</span>
          </span>
        </div>
        <Progress value={item.downloadedPerentage * 100} />
      </div>
    </div>
  );
};

export default Items;
