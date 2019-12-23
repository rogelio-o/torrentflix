import React, { useState } from "react";

import Season from "./Season";

const toggleSeason = (e, collapsedSeason, setCollapsedSeason) => {
  let event = e.target.dataset.event;
  setCollapsedSeason(
    collapsedSeason === Number(event) ? undefined : Number(event),
  );
};

const Seasons = ({ serie }) => {
  const [collapsedSeason, setCollapsedSeason] = useState(-1);

  return (
    <div className="serie-seasons">
      {serie.seasons.map((season, index) => (
        <Season
          key={index}
          serie={serie}
          season={season}
          index={index}
          collapsedSeason={collapsedSeason}
          toggleSeason={(e) =>
            toggleSeason(e, collapsedSeason, setCollapsedSeason)
          }
        />
      ))}
    </div>
  );
};

export default Seasons;