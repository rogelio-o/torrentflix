import "./ListTorrentsPage.css";

import qs from "query-string";
import React from "react";
import { connect } from "react-redux";
import { Container } from "reactstrap";

import eventEmitter from "../../event-emitter/eventEmitter";
import { openAlert } from "../../redux/actions";
import { attachToDeviceATorrentVideo } from "../../services/devicesService";
import { createTorrentFromMagnet, findAllTorrents, removeTorrent, searchTorrent } from "../../services/torrentsService";
import { errorHandling } from "../../utils/serviceUtils";
import Loading from "./../../components/Loading";
import BrowserPlayer from "./components/BrowserPlayer";
import CopyModal from "./components/CopyModal";
import Header from "./components/Header";
import Items from "./components/Items";
import MagnetModal from "./components/MagnetModal";
import RenderModal from "./components/RenderModal";
import SearchItems from "./components/SearchItems";

const mapResponseDataToItems = (data) => {
  const result = {};
  data.forEach((obj) => (result[obj.id] = obj));
  return result;
};

class ListTorrentsPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      items: {},
      loadingSearch: false,
      searchItems: null,
      searchQ: "",
      magnetModalOpen: false,
      copyItem: undefined,
    };
  }

  componentDidMount() {
    this._load();
    this._listenUpdates();

    const query = qs.parse(this.props.location.search, {
      ignoreQueryPrefix: true,
    });
    if (query.search) {
      this.setState({ searchQ: query.search });
      this._search(query.search);
    }
  }

  componentWillUnmount() {
    this._unlistenUpdates();
  }

  _listenUpdates() {
    this._downloadDataUpdatedSubscription = eventEmitter.on(
      "websocket.torrent-download-data-updated",
      (event) => {
        const items = this.state.items;
        const item = items[event.torrentId];
        if (item) {
          item.downloaded = event.downloaded;
          item.downloadedPerentage = event.downloadedPerentage;
          item.downloadSpeed = event.downloadSpeed;

          this.setState({ items });
        }
      },
    );
  }

  _unlistenUpdates() {
    if (this._downloadDataUpdatedSubscription) {
      this._downloadDataUpdatedSubscription.unsubscribe();
    }
  }

  _add(magnetURI) {
    this.setState({ loading: true });
    createTorrentFromMagnet(magnetURI)
      .then(() => this._load())
      .catch((error) =>
        errorHandling(this.props.openAlert, error, () =>
          this.setState({ loading: false }),
        ),
      );
  }

  _remove(id) {
    this.setState({ loading: true });
    removeTorrent(id)
      .then(() => this._load())
      .catch((error) =>
        errorHandling(this.props.openAlert, error, () =>
          this.setState({ loading: false }),
        ),
      );
  }

  _load() {
    this.setState({ loading: true });
    findAllTorrents()
      .then((response) => {
        this.setState({
          loading: false,
          items: mapResponseDataToItems(response.data),
          searchItems: null,
        });
      })
      .catch((error) =>
        errorHandling(this.props.openAlert, error, () =>
          this.setState({ loading: false, items: {} }),
        ),
      );
  }

  _onChangeSearch(e) {
    const value = e.target.value;
    this.setState({ searchQ: value });

    this._search(value);
  }

  _search(value) {
    if (value.length > 2) {
      this.setState({ loadingSearch: true });
      searchTorrent(value)
        .then((response) => {
          this.setState({
            loadingSearch: false,
            searchItems: response.data,
          });
        })
        .catch((error) =>
          errorHandling(this.props.openAlert, error, () =>
            this.setState({ loadingSearch: false, searchItems: null }),
          ),
        );
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

    attachToDeviceATorrentVideo(deviceId, torrentId, videoId)
      .then(() => {
        this.props.history.push({
          pathname: "/renderizations",
        });
      })
      .catch((error) =>
        errorHandling(this.props.openAlert, error, () =>
          this.setState({ loading: false }),
        ),
      );
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
      <Container className="list-torrent-page">
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
            items={Object.values(items)}
            openModal={this._openModal.bind(this)}
            openCopyModal={this._openCopyModal.bind(this)}
            remove={this._remove.bind(this)}
          />
        )}
        {this._renderModal(viewItem)}
        {this._renderBrowserPlayer(playerVideo)}
        {this._renderMagnetModal(magnetModalOpen)}
        {this._renderCopyModal(copyItem)}
      </Container>
    );
  }
}

export default connect(null, { openAlert })(ListTorrentsPage);
