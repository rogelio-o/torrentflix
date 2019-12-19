import dateFormat from "dateformat";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button, ButtonGroup, Col, ListGroupItem, ListGroupItemHeading, ListGroupItemText, Row } from "reactstrap";

import { formatEpisodeCode, formatTorrentSearchQuery } from "./../../../utils/episodesUtils";

const Episode = ({ serie, season, episode }) => {
  return (
    <ListGroupItem>
      <Row>
        <Col>
          <ListGroupItemHeading>
            <strong>{formatEpisodeCode(season, episode)}:</strong>{" "}
            {episode.name}
          </ListGroupItemHeading>
          <ListGroupItemText>
            <span className="text-secondary">
              {episode.date ? dateFormat(episode.date, "dd/mm/yyyy") : null}
            </span>{" "}
            {episode.description}
          </ListGroupItemText>
        </Col>
        <Col md="3">
          <ButtonGroup vertical>
            <Button
              tag={Link}
              to={{
                pathname: "/torrents",
                search: `?search=${formatTorrentSearchQuery(
                  serie,
                  season,
                  episode,
                )}`,
              }}
            >
              View
            </Button>
          </ButtonGroup>
        </Col>
      </Row>
    </ListGroupItem>
  );
};

export default Episode;
