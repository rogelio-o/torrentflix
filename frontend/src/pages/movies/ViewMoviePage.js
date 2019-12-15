import React from "react";
import axios from "axios";
import { Container, Row, Col, Button } from "reactstrap";

import Loading from "./../../components/Loading";

class ViewMoviePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: false, movie: {} };
  }

  componentDidMount() {
    const id = this.props.match.params.id;

    this._load(id);
  }

  _load(id) {
    this.setState({ loading: true });
    axios
      .get(`/api/movies/${id}`)
      .then((response) => {
        this.setState({
          loading: false,
          movie: response.data,
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
    const { loading, movie } = this.state;

    if (loading) {
      return <Loading />;
    } else {
      return (
        <Container>
          <Row>
            <Col xs="3">
              <img
                src={
                  movie.poster
                    ? `https://image.tmdb.org/t/p/original${movie.poster}`
                    : ""
                }
                alt={movie.title}
                className="img-fluid"
              />
              <div className="punctuation">{movie.voteAverage}</div>
              <ul className="item-properties">
                {movie.genres ? (
                  <li>
                    <strong>Genres:</strong> {movie.genres.join(", ")}
                  </li>
                ) : null}
              </ul>
            </Col>
            <Col xs="9">
              <div className="item-info">
                <h1>{movie.title}</h1>
                <p>{movie.description}</p>
              </div>
              <div className="movie-link">
                <Button>View</Button>
              </div>
            </Col>
          </Row>
        </Container>
      );
    }
  }
}

export default ViewMoviePage;
