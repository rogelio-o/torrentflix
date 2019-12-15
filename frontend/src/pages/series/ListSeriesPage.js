import axios from "axios";
import React from "react";

import ItemsList from "./../../components/ItemsList";

const mapItem = (item) => {
  return {
    title: item.name,
    subtitle: item.network,
    image: `https://www.thetvdb.com/banners/${item.poster}`,
    text: item.description,
  };
};

class ListSeriesPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: false, items: [] };
  }

  componentDidMount() {
    this.load();
  }

  load() {
    this.setState({ loading: true });
    axios
      .get("/api/series")
      .then((response) => {
        this.setState({ loading: false, items: response.data.map(mapItem) });
      })
      .catch((error) => {
        alert(error.message);
        console.error(error);
        this.setState({ loading: false, items: [] });
      });
  }

  render() {
    const { loading, items } = this.state;
    if (loading) {
      return <div>Loading...</div>;
    } else {
      return <ItemsList items={items} />;
    }
  }
}

export default ListSeriesPage;
