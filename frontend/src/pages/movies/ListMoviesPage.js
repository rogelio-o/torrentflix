import axios from "axios";
import qs from "query-string";
import React from "react";

import ItemCreateModal from "../../components/ItemCreateModal";
import ItemsList from "./../../components/ItemsList";
import ItemsListHeader from "./../../components/ItemsListHeader";
import Loading from "./../../components/Loading";
import Page from "./../../components/Page";

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
    this.state = { loading: false, page: { items: [], currentPage: 0 } };
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
    return mapItem(item, [
      {
        onClick: () => this._refresh(item.id),
        text: "Refresh",
        color: "warning",
      },
      { onClick: () => this._remove(item.id), text: "Remove", color: "danger" },
    ]);
  }

  _add(externalReferenceId) {
    this._closeAddModal();

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

  _load(page, q) {
    this._cancelRequest();

    this.setState({ loading: true });
    axios
      .get("/api/movies", {
        cancelToken: this._source.token,
        params: {
          page,
          order: "title",
          q,
        },
      })
      .then((response) => {
        const data = response.data;
        this.setState({
          loading: false,
          page: { ...data, items: data.items.map(this._mapItem.bind(this)) },
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
      this._load(this.state.page.currentPage, value);
    } else {
      this._load(this.state.page.currentPage);
    }
  }

  _openAddModal() {
    this.setState({ addModalOpen: true });
  }

  _closeAddModal() {
    this.setState({ addModalOpen: false });
  }

  _renderAddModal(addModalOpen) {
    if (addModalOpen) {
      return (
        <ItemCreateModal
          toggle={this._closeAddModal.bind(this)}
          mapItem={mapItem}
          searchPath="/api/movies/search"
          add={this._add.bind(this)}
        />
      );
    } else {
      return null;
    }
  }

  render() {
    const { loading, page, addModalOpen } = this.state;
    return (
      <div>
        <ItemsListHeader
          onSearchChange={this._onChangeSearch.bind(this)}
          onAddClick={this._openAddModal.bind(this)}
        />
        {loading ? (
          <Loading />
        ) : (
          <Page path="/movies" loadPage={this._load.bind(this)} page={page}>
            <ItemsList items={page.items} />
          </Page>
        )}
        {this._renderAddModal(addModalOpen)}
      </div>
    );
  }
}

export default ListMoviesPage;
