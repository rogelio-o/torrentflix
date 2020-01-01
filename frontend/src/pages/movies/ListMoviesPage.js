import qs from "query-string";
import React from "react";
import { FaRedo, FaTimes } from "react-icons/fa";
import { connect } from "react-redux";
import { Container } from "reactstrap";

import ItemCreateModal from "../../components/ItemCreateModal";
import ItemHeader from "../../components/ItemHeader";
import ItemsCarrousel from "../../components/ItemsCarrousel";
import { openAlert } from "../../redux/actions";
import {
  createMovie,
  findAllMovies,
  findAllMoviesNotWatched,
  refreshMovie,
  removeMovie,
  searchMovie,
} from "../../services/moviesService";
import { selectRandomly } from "../../utils/arrayUtils";
import { errorHandling } from "../../utils/serviceUtils";
import ItemsList from "./../../components/ItemsList";
import ItemsListHeader from "./../../components/ItemsListHeader";
import Loading from "./../../components/Loading";
import Page from "./../../components/Page";

const mapItem = (item, buttons) => {
  return {
    link: item.id ? `/movies/${item.id}` : undefined,
    title: item.title,
    image: `https://image.tmdb.org/t/p/original${item.backdrop}`,
    poster: `https://image.tmdb.org/t/p/original${item.poster}`,
    text: item.description,
    buttons,
  };
};

class ListMoviesPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      page: { items: [], currentPage: 0, numItems: 0 },
      loadingNotWatched: false,
      pageNotWatched: { items: [], currentPage: 0, numItems: 0 },
    };
  }

  componentDidMount() {
    const query = qs.parse(this.props.location.search, {
      ignoreQueryPrefix: true,
    });

    this._load(query.page || 0);
    this._loadNotWatched(0);
  }

  _mapItem(item) {
    return mapItem(item, [
      {
        onClick: () => this._refresh(item.id),
        text: "Refresh",
        icon: FaRedo,
      },
      { onClick: () => this._remove(item.id), text: "Remove", icon: FaTimes },
    ]);
  }

  _add(externalReferenceId) {
    this._closeAddModal();

    this.setState({ loading: true });
    createMovie(externalReferenceId)
      .then(() => this._load())
      .catch((error) =>
        errorHandling(this.props.openAlert, error, () =>
          this.setState({ loading: false }),
        ),
      );
  }

  _refresh(id) {
    this.setState({ loading: true });
    refreshMovie(id)
      .then(() => this._load())
      .catch((error) =>
        errorHandling(this.props.openAlert, error, () =>
          this.setState({ loading: false }),
        ),
      );
  }

  _remove(id) {
    this.setState({ loading: true });
    removeMovie(id)
      .then(() => this._load())
      .catch((error) =>
        errorHandling(this.props.openAlert, error, () =>
          this.setState({ loading: false }),
        ),
      );
  }

  _load(page, q) {
    this.setState({ loading: true });
    findAllMovies(page, q)
      .then((response) => {
        const data = response.data;
        this.setState({
          loading: false,
          page: { ...data, items: data.items.map(this._mapItem.bind(this)) },
        });
      })
      .catch((error) =>
        errorHandling(this.props.openAlert, error, () =>
          this.setState({ loading: false, page: { items: [] } }),
        ),
      );
  }

  _loadNotWatched(page, callback) {
    this.setState({ loadingNotWatched: true });
    findAllMoviesNotWatched(page)
      .then((response) => {
        const data = response.data;
        this.setState(
          {
            loadingNotWatched: false,
            pageNotWatched: {
              ...data,
              items: [
                ...this.state.pageNotWatched.items,
                ...data.items.map(this._mapItem.bind(this)),
              ],
            },
          },
          () => {
            if (callback) {
              callback();
            }
          },
        );
      })
      .catch((error) =>
        errorHandling(this.props.openAlert, error, () =>
          this.setState({
            loadingNotWatched: false,
            pageNotWatched: { items: [], currentPage: 0, numItems: 0 },
          }),
        ),
      );
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
          search={searchMovie}
          add={this._add.bind(this)}
        />
      );
    } else {
      return null;
    }
  }

  render() {
    const {
      loading,
      page,
      loadingNotWatched,
      pageNotWatched,
      addModalOpen,
    } = this.state;
    const randomItem = selectRandomly(page.items);
    return (
      <div className="list-movies-page">
        <ItemHeader item={randomItem} />
        <Container>
          {pageNotWatched.numItems > 0 ? (
            <ItemsCarrousel
              items={pageNotWatched.items}
              loading={loadingNotWatched}
              hasNextPage={
                pageNotWatched.totalPages - 1 > pageNotWatched.currentPage
              }
              loadNextPage={(callback) =>
                this._loadNotWatched(pageNotWatched.currentPage + 1, callback)
              }
            />
          ) : null}
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
        </Container>
        {this._renderAddModal(addModalOpen)}
      </div>
    );
  }
}

export default connect(null, { openAlert })(ListMoviesPage);
