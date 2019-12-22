import React from "react";
import { Link } from "react-router-dom";
import { Button } from "reactstrap";

const MovieLink = ({ q }) => {
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
    </div>
  );
};

export default MovieLink;
