import axios from "axios";
import qs from "query-string";
import React from "react";

import Loading from "./../../components/Loading";
import BrowserPlayer from "./components/BrowserPlayer";
import CopyModal from "./components/CopyModal";
import Header from "./components/Header";
import Items from "./components/Items";
import MagnetModal from "./components/MagnetModal";
import RenderModal from "./components/RenderModal";
import SearchItems from "./components/SearchItems";

class ListTorrentsPage extends React.Component {
  _source = axios.CancelToken.source();
  _sourceSearch = axios.CancelToken.source();

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      items: [],
      loadingSearch: false,
      searchItems: null,
      searchQ: "",
      magnetModalOpen: false,
      copyItem: undefined,
    };
  }

  componentDidMount() {
    this._load();

    const query = qs.parse(this.props.location.search, {
      ignoreQueryPrefix: true,
    });
    if (query.search) {
      this.setState({ searchQ: query.search });
      this._search(query.search);
    }
  }

  _cancelRequest() {
    this._source.cancel();
    this._source = axios.CancelToken.source();
  }

  _cancelRequestSearch() {
    this._sourceSearch.cancel();
    this._sourceSearch = axios.CancelToken.source();
  }

  _add(magnetURI) {
    this.setState({ loading: true });
    axios
      .post("/api/torrents", { magnet_uri: magnetURI })
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
      .delete(`/api/torrents/${id}`)
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
      .get("/api/torrents", {
        cancelToken: this._source.token,
      })
      .then((response) => {
        this.setState({
          loading: false,
          items: response.data,
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
    this.setState({ searchQ: value });

    this._search(value);
  }

  _search(value) {
    this._cancelRequestSearch();

    if (value.length > 2) {
      this.setState({ loadingSearch: true });
      this._request = axios
        .get("/api/torrents/search", {
          params: { q: value },
          cancelToken: this._sourceSearch.token,
        })
        .then((response) => {
          this.setState({
            loadingSearch: false,
            searchItems: response.data,
          });
        })
        .catch((error) => {
          if (!axios.isCancel(error)) {
            alert(error.message);
            console.error(error);
            this.setState({ loadingSearch: false, searchItems: null });
          }
        });
    } else {
      this.setState({ searchItems: null, loadingSearch: false });
    }
  }

  _renderTorrentsInDevice(device, torrent, video) {
    this._closeModal();

    if (device.id === "browser") {
      this._renderTorrentsInBrowser(video);
    } else {
      this._renderTorrentsInRemoteDevice(device.id, torrent.id, video.id);
    }
  }

  _renderTorrentsInRemoteDevice(deviceId, torrentId, videoId) {
    this.setState({ loading: true });

    axios
      .put(`/api/devices/${deviceId}/torrents/${torrentId}/videos/${videoId}`)
      .then(() => {
        this.props.history.push({
          pathname: "/renderizations",
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

  _renderTorrentsInBrowser(video) {
    this.setState({ playerVideo: video });
  }

  _closeBrowserPlayer() {
    this.setState({ playerVideo: undefined });
  }

  _openModal(viewItem) {
    this.setState({ viewItem });
  }

  _closeModal() {
    this.setState({ viewItem: undefined });
  }

  _openMagnetModal() {
    this.setState({ magnetModalOpen: true });
  }

  _closeMagnetModal() {
    this.setState({ magnetModalOpen: false });
  }

  _openCopyModal(copyItem) {
    this.setState({ copyItem });
  }

  _closeCopyModal() {
    this.setState({ copyItem: undefined });
  }

  _renderModal(viewItem) {
    if (viewItem) {
      return (
        <RenderModal
          torrent={viewItem}
          toggle={this._closeModal.bind(this)}
          submit={this._renderTorrentsInDevice.bind(this)}
        />
      );
    } else {
      return null;
    }
  }

  _renderBrowserPlayer(video) {
    if (video) {
      return (
        <BrowserPlayer
          video={video}
          toggle={this._closeBrowserPlayer.bind(this)}
        />
      );
    } else {
      return null;
    }
  }

  _renderMagnetModal(magnetModalOpen) {
    if (magnetModalOpen) {
      return (
        <MagnetModal
          add={this._add.bind(this)}
          toggle={this._closeMagnetModal.bind(this)}
        />
      );
    } else {
      return null;
    }
  }

  _renderCopyModal(copyItem) {
    if (copyItem) {
      return (
        <CopyModal
          torrent={copyItem}
          toggle={this._closeCopyModal.bind(this)}
        />
      );
    } else {
      return null;
    }
  }

  render() {
    const {
      loading,
      items,
      loadingSearch,
      searchItems,
      viewItem,
      playerVideo,
      searchQ,
      magnetModalOpen,
      copyItem,
    } = this.state;
    return (
      <div>
        <Header
          searchValue={searchQ}
          onSearchChange={this._onChangeSearch.bind(this)}
          onAddClick={this._openMagnetModal.bind(this)}
        />
        {loading || loadingSearch ? (
          <Loading />
        ) : searchItems ? (
          <SearchItems items={searchItems} add={this._add.bind(this)} />
        ) : (
          <Items
            items={items}
            openModal={this._openModal.bind(this)}
            openCopyModal={this._openCopyModal.bind(this)}
            remove={this._remove.bind(this)}
          />
        )}
        {this._renderModal(viewItem)}
        {this._renderBrowserPlayer(playerVideo)}
        {this._renderMagnetModal(magnetModalOpen)}
        {this._renderCopyModal(copyItem)}
      </div>
    );
  }
}

export default ListTorrentsPage;
