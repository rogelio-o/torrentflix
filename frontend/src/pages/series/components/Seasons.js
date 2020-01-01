import "./Seasons.css";

import React, { useState } from "react";
import { ButtonDropdown, ButtonGroup, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";

import WatchedButton from "../../../components/WatchedButton";
import { updateSerieEpisodeWatched } from "../../../services/seriesService";
import Episodes from "./Episodes";

const calcNextSeasonToWatch = (seasons) => {
  for (const season of seasons) {
    if (!isSeasonWatched(season)) {
      return season;
    }
  }

  return seasons[0];
};

const isSeasonWatched = (season) => {
  return season && !season.episodes.some((episode) => !episode.watched);
};

const updateSeasonWatched = (serie, season, watched) => {
  return Promise.all(
    season.episodes.map((episode) =>
      updateSerieEpisodeWatched(
        serie.id,
        season.number,
        episode.number,
        watched,
      ),
    ),
  );
};

const Seasons = ({ serie, setSeasonWatched, setEpisodeWatched }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeSeason, setActiveSeason] = useState(
    calcNextSeasonToWatch(serie.seasons),
  );
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  return (
    <div className="serie-seasons">
      <div className="serie-seasons-header">
        <ButtonGroup>
          <ButtonDropdown
            className="dropdown-select"
            isOpen={dropdownOpen}
            toggle={toggleDropdown}
          >
            <DropdownToggle caret>
              {activeSeason ? `Season ${activeSeason.number}` : "Seasons"}
            </DropdownToggle>
            <DropdownMenu>
              {serie.seasons.map((season, index) => (
                <DropdownItem
                  key={index}
                  onClick={() => setActiveSeason(season)}
                >
                  Season {season.number}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </ButtonDropdown>
          {activeSeason ? (
            <WatchedButton
              watched={isSeasonWatched(activeSeason)}
              setWatched={(watched) => setSeasonWatched(activeSeason, watched)}
              updateWatched={(watched) =>
                updateSeasonWatched(serie, activeSeason, watched)
              }
            />
          ) : null}
        </ButtonGroup>
      </div>
      {activeSeason ? (
        <Episodes
          serie={serie}
          season={activeSeason}
          setEpisodeWatched={setEpisodeWatched}
        />
      ) : null}
    </div>
  );
};

export default Seasons;
