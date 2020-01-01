import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Button } from "reactstrap";

const calcIcon = (watched, isOver) => {
  if (watched) {
    if (isOver) {
      return <FaRegEyeSlash />;
    } else {
      return <FaRegEye />;
    }
  } else {
    if (isOver) {
      return <FaRegEye />;
    } else {
      return <FaRegEyeSlash />;
    }
  }
};

const WatchedButton = ({ watched, updateWatched }) => {
  const [isOver, setIsOver] = useState(false);

  return (
    <Button
      className="watched-btn"
      onClick={() => updateWatched(!watched)}
      onMouseOver={() => setIsOver(true)}
      onMouseOut={() => setIsOver(false)}
    >
      {calcIcon(watched, isOver)}
    </Button>
  );
};

export default WatchedButton;
