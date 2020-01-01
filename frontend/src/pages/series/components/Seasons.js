import "./Seasons.css";

import React, { useState } from "react";
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap";

import Episodes from "./Episodes";

const calcNextSeasonToWatch = (seasons) => {
  for (const season of seasons) {
    if (season.episodes.some((episode) => !episode.watched)) {
      return season;
    }
  }

  return seasons[0];
};

const Seasons = ({ serie, updateWatched }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeSeason, setActiveSeason] = useState(
    calcNextSeasonToWatch(serie.seasons),
  );
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  return (
    <div className="serie-seasons">
      <div className="serie-seasons-header">
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
              <DropdownItem key={index} onClick={() => setActiveSeason(season)}>
                Season {season.number}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </ButtonDropdown>
      </div>
      {activeSeason ? (
        <Episodes
          serie={serie}
          season={activeSeason}
          updateWatched={updateWatched}
        />
      ) : null}
    </div>
  );
};

export default Seasons;
