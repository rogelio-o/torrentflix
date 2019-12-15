import axios from "axios";
import React from "react";

import ItemsList from "./../../components/ItemsList";
import Loading from "./../../components/Loading";
import SearchForm from "./../../components/SearchForm";

const mapItem = (item, buttons) => {
  return {
    link: item.id ? `/movies/${item.id}` : undefined,
    title: item.title,
    image: `https://image.tmdb.org/t/p/original${item.backdrop}`,
    text: item.description,
    buttons,
  };
};

class ListMoviesPage extends React.Component {
  _source = axios.CancelToken.source();

  constructor(props) {
    super(props);
    this.state = { loading: false, items: [], searchItems: null };
  }

  componentDidMount() {
    this._load();
  }

  _cancelRequest() {
    this._source.cancel();
    this._source = axios.CancelToken.source();
  }

  _mapItem(item) {
    return mapItem(item, [
      {
        onClick: () => this._refresh(item.id),
        text: "Refresh",
        color: "warning",
      },
      { onClick: () => this._remove(item.id), text: "Remove", color: "danger" },
    ]);
  }

  _mapSearchItem(item) {
    return mapItem(item, [
      {
        onClick: () => this._add(item.externalReferenceId),
        text: "Add",
        color: "success",
      },
    ]);
  }

  _add(externalReferenceId) {
    this.setState({ loading: true });
    axios
      .post("/api/movies", { externalReferenceId })
      .then(() => this._load())
      .catch((error) => {
        alert(error.message);
        console.error(error);
        this.setState({ loading: false });
      });
  }

  _refresh(id) {
    this.setState({ loading: true });
    axios
      .put(`/api/movies/${id}/refresh`)
      .then(() => this._load())
      .catch((error) => {
        alert(error.message);
        console.error(error);
        this.setState({ loading: false });
      });
  }

  _remove(id) {
    this.setState({ loading: true });
    axios
      .delete(`/api/movies/${id}`)
      .then(() => this._load())
      .catch((error) => {
        alert(error.message);
        console.error(error);
        this.setState({ loading: false });
      });
  }

  _load() {
    this._cancelRequest();

    this.setState({ loading: true });
    axios
      .get("/api/movies", {
        cancelToken: this._source.token,
      })
      .then((response) => {
        this.setState({
          loading: false,
          items: response.data.map(this._mapItem.bind(this)),
          searchItems: null,
        });
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          alert(error.message);
          console.error(error);
          this.setState({ loading: false, items: [] });
        }
      });
  }

  _onChangeSearch(e) {
    const value = e.target.value;

    if (value.length > 2) {
      this._cancelRequest();

      this.setState({ loading: true });
      this._request = axios
        .get("/api/movies/search", {
          params: { q: value },
          cancelToken: this._source.token,
        })
        .then((response) => {
          this.setState({
            loading: false,
            searchItems: response.data.map(this._mapSearchItem.bind(this)),
          });
        })
        .catch((error) => {
          if (!axios.isCancel(error)) {
            alert(error.message);
            console.error(error);
            this.setState({ loading: false, searchItems: null });
          }
        });
    } else {
      this.setState({ searchItems: null });
    }
  }

  render() {
    const { loading, items, searchItems } = this.state;
    return (
      <div>
        <SearchForm onChangeSearch={this._onChangeSearch.bind(this)} />
        {loading ? (
          <Loading />
        ) : (
          <ItemsList items={searchItems ? searchItems : items} />
        )}
      </div>
    );
  }
}

export default ListMoviesPage;
