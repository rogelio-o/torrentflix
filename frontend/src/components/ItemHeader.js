import "./ItemHeader.css";

import React from "react";
import { FaPlay } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Button, ButtonGroup } from "reactstrap";

const ItemHeader = ({ item }) => {
  if (!item) {
    return <div className="item-header-empty" />;
  } else {
    return (
      <div
        className="item-header"
        style={{ backgroundImage: `url(${item.image})` }}
      >
        <div className="item-header-data">
          <h1>{item.title}</h1>
          <p>{item.text}</p>
          <ButtonGroup>
            <Button tag={Link} to={item.link}>
              <FaPlay />
              View
            </Button>
          </ButtonGroup>
        </div>
      </div>
    );
  }
};

export default ItemHeader;
