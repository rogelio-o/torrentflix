import React, { useState } from "react";
import { Card, CardBody, CardHeader, Collapse } from "reactstrap";

import Episodes from "./Episodes";

const Season = ({ collapsedSeason, index, serie, season, toggleSeason }) => {
  return (
    <Card key={index}>
      <CardHeader onClick={toggleSeason} data-event={index}>
        Season {season.number}
      </CardHeader>
      <Collapse isOpen={collapsedSeason === index}>
        <CardBody>
          <Episodes serie={serie} season={season} />
        </CardBody>
      </Collapse>
    </Card>
  );
};

export default Season;
