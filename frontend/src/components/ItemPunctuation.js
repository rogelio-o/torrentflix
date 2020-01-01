import "./ItemPunctuation.css";

import React, { useState } from "react";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";
import { Tooltip } from "reactstrap";

import { range } from "../utils/arrayUtils";

const calcIcon = (punctuation, num) => {
  if (punctuation > num) {
    return <FaStar className="whole" />;
  } else if (punctuation > num - 0.5) {
    return <FaStarHalfAlt className="half" />;
  } else {
    return <FaRegStar />;
  }
};

const ItemPunctuation = ({ punctuation }) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggle = () => setTooltipOpen(!tooltipOpen);

  return (
    <div className="punctuation-wrapper">
      <ul className="punctuation-stars" id="punctuation-stars">
        {range(1, 10).map((num) => (
          <li key={num}>{calcIcon(punctuation, num)}</li>
        ))}
      </ul>
      <Tooltip
        placement="bottom"
        isOpen={tooltipOpen}
        target="punctuation-stars"
        toggle={toggle}
      >
        {punctuation}
      </Tooltip>
    </div>
  );
};

export default ItemPunctuation;
