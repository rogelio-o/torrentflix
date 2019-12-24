import React, { useState } from "react";
import { ListGroup } from "reactstrap";

import Episode from "./Episode";

const Episodes = ({ serie, season, updateWatched }) => {
  return (
    <ListGroup>
      {season.episodes.map((episode) => (
        <Episode
          serie={serie}
          season={season}
          episode={episode}
          updateWatched={updateWatched}
        />
      ))}
    </ListGroup>
  );
};

export default Episodes;
