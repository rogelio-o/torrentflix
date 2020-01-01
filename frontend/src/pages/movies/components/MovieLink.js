import "./MovieLink.css";

import React from "react";
import { FaPlay } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Button } from "reactstrap";

import WatchedButton from "../../../components/WatchedButton";

const MovieLink = ({ q, watched, updateWatched }) => {
  return (
    <div className="movie-link">
      <Button
        tag={Link}
        to={{
          pathname: "/torrents",
          search: `?search=${q}`,
        }}
      >
        <FaPlay />
      </Button>

      <WatchedButton watched={watched} updateWatched={updateWatched} />
    </div>
  );
};

export default MovieLink;
