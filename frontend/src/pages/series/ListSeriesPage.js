import axios from "axios";
import qs from "query-string";
import React from "react";

import ItemsList from "./../../components/ItemsList";
import Loading from "./../../components/Loading";
import Page from "./../../components/Page";
import SearchForm from "./../../components/SearchForm";

const mapItem = (item, imagePrefix, buttons) => {
  return {
    link: item.id ? `/series/${item.id}` : undefined,
    title: item.name,
    subtitle: item.network,
    image: `https://www.thetvdb.com${imagePrefix}${item.backdrop}`,
    text: item.description,
    buttons,
  };
};

class ListSeriesPage extends React.Component {
  _source = axios.CancelToken.source();

  constructor(props) {
    super(props);
    this.state = { loading: false, page: { items: [] }, searchItems: null };
  }

  componentDidMount() {
    const query = qs.parse(this.props.location.search, {
      ignoreQueryPrefix: true,
    });

    this._load(query.page || 0);
  }

  _cancelRequest() {
    this._source.cancel();
    this._source = axios.CancelToken.source();
  }

  _mapItem(item) {
    return mapItem(item, "/banners/", [
      {
        onClick: () => this._refresh(item.id),
        text: "Refresh",
        color: "warning",
      },
      { onClick: () => this._remove(item.id), text: "Remove", color: "danger" },
    ]);
  }

  _mapSearchItem(item) {
    return mapItem(item, "", [
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
      .post("/api/series", { externalReferenceId })
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
      .put(`/api/series/${id}/refresh`)
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
      .delete(`/api/series/${id}`)
      .then(() => this._load())
      .catch((error) => {
        alert(error.message);
        console.error(error);
        this.setState({ loading: false });
      });
  }

  _load(page) {
    this._cancelRequest();

    this.setState({ loading: true });
    axios
      .get("/api/series", {
        cancelToken: this._source.token,
        params: {
          page,
        },
      })
      .then((response) => {
        const data = response.data;
        this.setState({
          loading: false,
          page: { ...data, items: data.items.map(this._mapItem.bind(this)) },
          searchItems: null,
        });
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          alert(error.message);
          console.error(error);
          this.setState({ loading: false, page: { items: [] } });
        }
      });
  }

  _onChangeSearch(e) {
    const value = e.target.value;

    if (value.length > 2) {
      this._cancelRequest();

      this.setState({ loading: true });
      this._request = axios
        .get("/api/series/search", {
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
    const { loading, page, searchItems } = this.state;
    return (
      <div>
        <SearchForm onChangeSearch={this._onChangeSearch.bind(this)} />
        {loading ? (
          <Loading />
        ) : (
          <Page path="/series" loadPage={this._load.bind(this)} page={page}>
            <ItemsList items={searchItems ? searchItems : page.items} />
          </Page>
        )}
      </div>
    );
  }
}

export default ListSeriesPage;
