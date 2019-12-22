import axios from "axios";
import React from "react";

import ItemAttributes from "../../components/ItemAttributes";
import ItemData from "../../components/ItemData";
import ItemPage from "../../components/ItemPage";
import ItemPageSection from "../../components/ItemPageSection";
import ItemPoster from "../../components/ItemPoster";
import ItemPunctuation from "../../components/ItemPunctuation";
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
    const { loading, serie } = this.state;

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
            <Seasons serie={serie} />
          </ItemPageSection>
        </ItemPage>
      );
    }
  }
}

export default ViewSeriePage;
