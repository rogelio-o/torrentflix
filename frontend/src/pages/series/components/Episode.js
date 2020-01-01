import "./Episode.css";

import dateFormat from "dateformat";
import React from "react";
import { Link } from "react-router-dom";

import WatchedButton from "../../../components/WatchedButton";
import { formatEpisodeCode, formatTorrentSearchQuery } from "../../../utils/episodesUtils";

const Episode = ({ serie, season, episode, updateWatched }) => {
  return (
    <div className={"episode" + (episode.watched ? " episode-watched" : "")}>
      <div
        className="episode-image"
        style={{
          backgroundImage: `url(https://www.thetvdb.com/banners/${episode.poster})`,
        }}
      >
        <span className="episode-number">
          {formatEpisodeCode(season, episode)}
        </span>
        <Link
          to={{
            pathname: "/torrents",
            search: `?search=${formatTorrentSearchQuery(
              serie,
              season,
              episode,
            )}`,
          }}
          className="episode-link"
        ></Link>
        <WatchedButton
          watched={episode.watched}
          updateWatched={(watched) => updateWatched(season, episode, watched)}
        />
      </div>
      <div className="episode-data">
        <div className="episode-header">
          <h3 className="episode-name">
            <Link
              to={{
                pathname: "/torrents",
                search: `?search=${formatTorrentSearchQuery(
                  serie,
                  season,
                  episode,
                )}`,
              }}
            >
              {episode.name}
            </Link>
          </h3>
          <p className="episode-date">
            {episode.date ? dateFormat(episode.date, "dd/mm/yyyy") : null}
          </p>
        </div>
        <p className="episode-description">{episode.description}</p>
      </div>
    </div>
  );
};

export default Episode;
