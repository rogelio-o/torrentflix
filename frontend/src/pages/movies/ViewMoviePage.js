import React from "react";
import { connect } from "react-redux";

import ItemAttributes from "../../components/ItemAttributes";
import ItemData from "../../components/ItemData";
import ItemPage from "../../components/ItemPage";
import ItemPageSection from "../../components/ItemPageSection";
import ItemPoster from "../../components/ItemPoster";
import ItemPunctuation from "../../components/ItemPunctuation";
import { openAlert } from "../../redux/actions";
import { findMovieById, updateMovieWatched } from "../../services/moviesService";
import { errorHandling } from "../../utils/serviceUtils";
import Loading from "./../../components/Loading";
import MovieLink from "./components/MovieLink";

const formatTorrentSearchQuery = (movie) => {
  return encodeURI(movie.title);
};

const parseMovieAttributes = (movie) => {
  const attributes = [];
  if (movie.genres) {
    attributes.push({ label: "Genres", value: movie.genres });
  }

  return attributes;
};

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
    findMovieById(id)
      .then((response) => {
        this.setState({
          loading: false,
          movie: response.data,
        });
      })
      .catch((error) =>
        errorHandling(this.props.openAlert, error, () =>
          this.setState({ loading: false }),
        ),
      );
  }

  _updateWatched(watched) {
    this.setState({ loading: true });
    const movie = this.state.movie;
    updateMovieWatched(movie.id, watched)
      .then(() => {
        this.setState({
          loading: false,
          movie: { ...movie, watched },
        });
      })
      .catch((error) =>
        errorHandling(this.props.openAlert, error, () =>
          this.setState({ loading: false }),
        ),
      );
  }

  render() {
    const { loading, movie } = this.state;

    const attributes = parseMovieAttributes(movie);

    if (loading) {
      return <Loading />;
    } else {
      return (
        <ItemPage>
          <ItemPageSection section="subdata">
            <ItemPoster
              poster={
                movie.poster
                  ? `https://image.tmdb.org/t/p/original${movie.poster}`
                  : ""
              }
              alt={movie.name}
            />
            <ItemPunctuation punctuation={movie.voteAverage} />
            <ItemAttributes attributes={attributes} />
          </ItemPageSection>
          <ItemPageSection section="data">
            <ItemData title={movie.title} description={movie.description} />
            <MovieLink
              q={formatTorrentSearchQuery(movie)}
              watched={movie.watched}
              updateWatched={this._updateWatched.bind(this)}
            />
          </ItemPageSection>
        </ItemPage>
      );
    }
  }
}

export default connect(null, { openAlert })(ViewMoviePage);
