import React from "react";

import ItemAttributes from "../../components/ItemAttributes";
import ItemData from "../../components/ItemData";
import ItemPage from "../../components/ItemPage";
import ItemPageSection from "../../components/ItemPageSection";
import ItemPoster from "../../components/ItemPoster";
import ItemPunctuation from "../../components/ItemPunctuation";
import { findSerieById, updateSerieEpisodeWatched } from "../../services/seriesService";
import Loading from "./../../components/Loading";
import Seasons from "./components/Seasons";

const DEFAULT_POSTER = "";

const parseSerieAttributes = (serie) => {
  const attributes = [{ label: "Network", value: serie.network }];
  if (serie.genres) {
    attributes.push({ label: "Genres", value: serie.genres });
  }

  return attributes;
};

class ViewSeriePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      serie: { seasons: [] },
      collapsedSeason: -1,
    };
  }

  componentDidMount() {
    const id = this.props.match.params.id;

    this._load(id);
  }

  _setCollapsedSeason(collapsedSeason) {
    this.setState({ collapsedSeason });
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
      .catch((error) => {
        alert(error.message);
        console.error(error);
        this.setState({ loading: false });
      });
  }

  _updateWatched(season, episode, watched) {
    const pageXOffset = window.pageXOffset;
    const pageYOffset = window.pageYOffset;
    const serie = this.state.serie;

    this.setState({ loading: true });
    updateSerieEpisodeWatched(serie.id, season.number, episode.number, watched)
      .then(() => {
        episode.watched = watched;

        this.setState(
          {
            loading: false,
          },
          () => {
            window.scrollTo(pageXOffset, pageYOffset);
          },
        );
      })
      .catch((error) => {
        alert(error.message);
        console.error(error);
        this.setState({ loading: false });
      });
  }

  render() {
    const { loading, serie, collapsedSeason } = this.state;

    const attributes = parseSerieAttributes(serie);

    if (loading) {
      return <Loading />;
    } else {
      return (
        <ItemPage>
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
              updateWatched={this._updateWatched.bind(this)}
              collapsedSeason={collapsedSeason}
              setCollapsedSeason={this._setCollapsedSeason.bind(this)}
            />
          </ItemPageSection>
        </ItemPage>
      );
    }
  }
}

export default ViewSeriePage;
