import axios from "axios";
import dateFormat from "dateformat";
import React from "react";
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Col,
  Collapse,
  Container,
  ListGroup,
  ListGroupItem,
  ListGroupItemHeading,
  ListGroupItemText,
  Row,
} from "reactstrap";

import Loading from "./../../components/Loading";

const formatEpisodeNumber = (number) => {
  return number < 10 ? "0" + number : number;
};

const formatEpisodeCode = (season, episode) => {
  return (
    "S" +
    formatEpisodeNumber(season.number) +
    "E" +
    formatEpisodeNumber(episode.number)
  );
};

class ViewSeriePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: false, serie: { seasons: [] } };
  }

  componentDidMount() {
    const id = this.props.match.params.id;

    this._load(id);
  }

  _load(id) {
    this.setState({ loading: true });
    axios
      .get(`/api/series/${id}`)
      .then((response) => {
        this.setState({
          loading: false,
          serie: response.data,
        });
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          alert(error.message);
          console.error(error);
          this.setState({ loading: false });
        }
      });
  }

  _toggleSeason(e) {
    let event = e.target.dataset.event;
    console.log(event);
    this.setState({
      collapseSeason:
        this.state.collapseSeason === Number(event) ? undefined : Number(event),
    });
  }

  render() {
    const { loading, serie, collapseSeason } = this.state;

    if (loading) {
      return <Loading />;
    } else {
      return (
        <Container>
          <Row>
            <Col md="3">
              <img
                src={
                  serie.poster
                    ? `https://www.thetvdb.com/banners/${serie.poster}`
                    : ""
                }
                alt={serie.name}
                className="img-fluid"
              />
              <div className="punctuation">{serie.voteAverage}</div>
              <ul className="item-properties">
                <li>
                  <strong>Network:</strong> {serie.network}
                </li>
                {serie.genres ? (
                  <li>
                    <strong>Genres:</strong> {serie.genres.join(", ")}
                  </li>
                ) : null}
              </ul>
            </Col>
            <Col>
              <div className="item-info">
                <h1>{serie.name}</h1>
                <p>{serie.description}</p>
              </div>
              <div className="serie-seasons">
                {serie.seasons.map((season, index) => {
                  return (
                    <Card key={index}>
                      <CardHeader
                        onClick={this._toggleSeason.bind(this)}
                        data-event={index}
                      >
                        Season {season.number}
                      </CardHeader>
                      <Collapse isOpen={collapseSeason === index}>
                        <CardBody>
                          <ListGroup>
                            {season.episodes.map((episode) => (
                              <ListGroupItem>
                                <Row>
                                  <Col>
                                    <ListGroupItemHeading>
                                      <strong>
                                        {formatEpisodeCode(season, episode)}:
                                      </strong>{" "}
                                      {episode.name}
                                    </ListGroupItemHeading>
                                    <ListGroupItemText>
                                      <span className="text-secondary">
                                        {episode.date
                                          ? dateFormat(
                                              episode.date,
                                              "dd/mm/yyyy",
                                            )
                                          : null}
                                      </span>{" "}
                                      {episode.description}
                                    </ListGroupItemText>
                                  </Col>
                                  <Col md="3">
                                    <ButtonGroup vertical>
                                      <Button>View</Button>
                                    </ButtonGroup>
                                  </Col>
                                </Row>
                              </ListGroupItem>
                            ))}
                          </ListGroup>
                        </CardBody>
                      </Collapse>
                    </Card>
                  );
                })}
              </div>
            </Col>
          </Row>
        </Container>
      );
    }
  }
}

export default ViewSeriePage;
