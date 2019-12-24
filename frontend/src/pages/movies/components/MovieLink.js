import React from "react";
import { Link } from "react-router-dom";
import { Button } from "reactstrap";

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
        View
      </Button>

      {watched ? (
        <Button color="primary" onClick={() => updateWatched(false)}>
          Mark as NOT watched
        </Button>
      ) : (
        <Button color="warning" onClick={() => updateWatched(true)}>
          Mark as watched
        </Button>
      )}
    </div>
  );
};

export default MovieLink;
