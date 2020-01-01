import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash, FaSpinner } from "react-icons/fa";
import { connect } from "react-redux";
import { Button } from "reactstrap";

import { openAlert } from "../redux/actions";
import { errorHandling } from "../utils/serviceUtils";

const calcIcon = (watched, isOver, loading) => {
  if (loading) {
    return <FaSpinner className="fa-spinner" />;
  } else if (watched) {
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

const WatchedButton = ({ watched, setWatched, updateWatched, openAlert }) => {
  const [isOver, setIsOver] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateWatchedOnClick = async () => {
    setLoading(true);
    try {
      const newWatched = !watched;
      await updateWatched(newWatched);
      setWatched(newWatched);
      setLoading(false);
    } catch (error) {
      errorHandling(openAlert, error, () => setLoading(false));
    }
  };

  return (
    <Button
      className="watched-btn"
      onClick={updateWatchedOnClick}
      onMouseOver={() => setIsOver(true)}
      onMouseOut={() => setIsOver(false)}
    >
      {calcIcon(watched, isOver, loading)}
    </Button>
  );
};

export default connect(null, { openAlert })(WatchedButton);
