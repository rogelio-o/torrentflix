import React, { useState } from "react";
import { ListGroup } from "reactstrap";

import Episode from "./Episode";

const Episodes = ({ serie, season }) => {
  return (
    <ListGroup>
      {season.episodes.map((episode) => (
        <Episode serie={serie} season={season} episode={episode} />
      ))}
    </ListGroup>
  );
};

export default Episodes;
