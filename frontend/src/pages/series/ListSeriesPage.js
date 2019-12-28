import qs from "query-string";
import React from "react";

import ItemCreateModal from "../../components/ItemCreateModal";
import ItemsListHeader from "../../components/ItemsListHeader";
import { createSerie, findAllSeries, refreshSerie, removeSerie, searchSerie } from "../../services/seriesService";
import { isCancelError } from "../../utils/serviceUtils";
import ItemsList from "./../../components/ItemsList";
import Loading from "./../../components/Loading";
import Page from "./../../components/Page";

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
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      page: { items: [], currentPage: 0 },
      addModalOpen: false,
    };
  }

  componentDidMount() {
    const query = qs.parse(this.props.location.search, {
      ignoreQueryPrefix: true,
    });

    this._load(query.page || 0);
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

  _refresh(id) {
    this.setState({ loading: true });
    refreshSerie(id)
      .then(() => this._load())
      .catch((error) => {
        alert(error.message);
        console.error(error);
        this.setState({ loading: false });
      });
  }

  _remove(id) {
    this.setState({ loading: true });
    removeSerie(id)
      .then(() => this._load())
      .catch((error) => {
        alert(error.message);
        console.error(error);
        this.setState({ loading: false });
      });
  }

  _add(externalReferenceId) {
    this._closeAddModal();

    this.setState({ loading: true });
    createSerie(externalReferenceId)
      .then(() => this._load())
      .catch((error) => {
        alert(error.message);
        console.error(error);
        this.setState({ loading: false });
      });
  }

  _load(page, q) {
    this.setState({ loading: true });
    findAllSeries(page, q)
      .then((response) => {
        const data = response.data;
        this.setState({
          loading: false,
          page: { ...data, items: data.items.map(this._mapItem.bind(this)) },
        });
      })
      .catch((error) => {
        if (!isCancelError(error)) {
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
          mapItem={(item, buttons) => mapItem(item, "", buttons)}
          search={searchSerie}
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
          <Page path="/series" loadPage={this._load.bind(this)} page={page}>
            <ItemsList items={page.items} />
          </Page>
        )}
        {this._renderAddModal(addModalOpen)}
      </div>
    );
  }
}

export default ListSeriesPage;
