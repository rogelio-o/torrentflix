import "./MovieLink.css";

import React from "react";
import { FaPlay } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Button } from "reactstrap";

import WatchedButton from "../../../components/WatchedButton";
import { updateMovieWatched } from "../../../services/moviesService";

const formatTorrentSearchQuery = (movie) => {
  return encodeURI(movie.title);
};

const MovieLink = ({ movie, setMovieWatched }) => {
  return (
    <div className="movie-link">
      <Button
        tag={Link}
        to={{
          pathname: "/torrents",
          search: `?search=${formatTorrentSearchQuery(movie)}`,
        }}
      >
        <FaPlay />
      </Button>

      <WatchedButton
        watched={movie.watched}
        setWatched={setMovieWatched}
        updateWatched={(watched) => updateMovieWatched(movie.id, watched)}
      />
    </div>
  );
};

export default MovieLink;
