import axios from "axios";
import React from "react";
import { Col, Container, Row } from "reactstrap";

import Loading from "./../../components/Loading";
import Seasons from "./components/Seasons";

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
              <Seasons serie={serie} />
            </Col>
          </Row>
        </Container>
      );
    }
  }
}

export default ViewSeriePage;
