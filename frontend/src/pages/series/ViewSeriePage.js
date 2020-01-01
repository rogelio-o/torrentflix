import React from "react";
import { connect } from "react-redux";

import ItemAttributes from "../../components/ItemAttributes";
import ItemData from "../../components/ItemData";
import ItemPage from "../../components/ItemPage";
import ItemPageSection from "../../components/ItemPageSection";
import ItemPoster from "../../components/ItemPoster";
import ItemPunctuation from "../../components/ItemPunctuation";
import { openAlert } from "../../redux/actions";
import { findSerieById } from "../../services/seriesService";
import { errorHandling } from "../../utils/serviceUtils";
import Loading from "./../../components/Loading";
import Seasons from "./components/Seasons";

const DEFAULT_POSTER = "";

const parseSerieAttributes = (serie) => {
  const attributes = [{ label: "Network", value: serie.network }];
  if (serie.genres) {
    attributes.push({ label: "Genres", value: serie.genres.join(", ") });
  }

  return attributes;
};

class ViewSeriePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      serie: { seasons: [] },
    };
  }

  componentDidMount() {
    const id = this.props.match.params.id;

    this._load(id);
  }

  _load(id) {
    this.setState({ loading: true });
    findSerieById(id)
      .then((response) => {
        this.setState({
          loading: false,
          serie: response.data,
        });
      })
      .catch((error) =>
        errorHandling(this.props.openAlert, error, () =>
          this.setState({ loading: false }),
        ),
      );
  }

  _setSeasonWatched(season, watched) {
    const { serie } = this.state;
    season.episodes.forEach((episode) => (episode.watched = watched));
    this.setState({ serie });
  }

  _setEpisodeWatched(episode, watched) {
    const { serie } = this.state;
    episode.watched = watched;
    this.setState({ serie });
  }

  render() {
    const { loading, serie } = this.state;

    const attributes = parseSerieAttributes(serie);

    if (loading) {
      return <Loading />;
    } else {
      return (
        <ItemPage
          backdrop={`https://www.thetvdb.com/banners/${serie.backdrop}`}
        >
          <ItemPageSection section="subdata">
            <ItemPoster
              poster={
                serie.poster
                  ? `https://www.thetvdb.com/banners/${serie.poster}`
                  : DEFAULT_POSTER
              }
              alt={serie.name}
            />
            <ItemPunctuation punctuation={serie.voteAverage} />
            <ItemAttributes attributes={attributes} />
          </ItemPageSection>
          <ItemPageSection section="data">
            <ItemData title={serie.name} description={serie.description} />
            <Seasons
              serie={serie}
              setSeasonWatched={this._setSeasonWatched.bind(this)}
              setEpisodeWatched={this._setEpisodeWatched.bind(this)}
            />
          </ItemPageSection>
        </ItemPage>
      );
    }
  }
}

export default connect(null, { openAlert })(ViewSeriePage);
