import "video.js/dist/video-js.css";

import axios from "axios";
import qs from "query-string";
import React from "react";
import {
  Button,
  ButtonGroup,
  CustomInput,
  Form,
  FormGroup,
  Label,
  ListGroup,
  ListGroupItem,
  ListGroupItemHeading,
  ListGroupItemText,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Progress,
} from "reactstrap";

import Loading from "./../../components/Loading";
import SearchForm from "./../../components/SearchForm";
import VideoPlayer from "./../../components/VideoPlayer";

class ListTorrentsPage extends React.Component {
  _source = axios.CancelToken.source();
  _sourceSearch = axios.CancelToken.source();
  _sourceDevices = axios.CancelToken.source();

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      items: [],
      loadingSearch: false,
      searchItems: null,
      devices: [],
      loadingDevices: false,
      searchQ: "",
    };
  }

  componentDidMount() {
    this._load();

    this._loadDevices();

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

  _cancelRequestDevices() {
    this._sourceDevices.cancel();
    this._sourceDevices = axios.CancelToken.source();
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

  _loadDevices() {
    this._cancelRequestDevices();

    this.setState({ loadingDevices: true });
    axios
      .get("/api/devices", {
        cancelToken: this._sourceDevices.token,
      })
      .then((response) => {
        this.setState({
          loadingDevices: false,
          devices: response.data,
        });
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          alert(error.message);
          console.error(error);
          this.setState({ loadingDevices: false, devices: [] });
        }
      });
  }

  _loadVideos(torrentId) {
    this.setState({ loadingVideos: true });
    axios
      .get(`/api/torrents/${torrentId}/videos`)
      .then((response) => {
        this.setState({
          loadingVideos: false,
          videos: response.data,
        });
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          alert(error.message);
          console.error(error);
          this.setState({ loadingVideos: false, videos: [] });
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

  _renderTorrentsInDevice(deviceId, torrentId, videoId) {
    this._closeModal();

    if (deviceId === "browser") {
      this._renderTorrentsInBrowser(
        this.state.videos.filter((video) => video.id === videoId)[0],
      );
    } else {
      this._renderTorrentsInRemoteDevice(deviceId, torrentId, videoId);
    }
  }

  _renderTorrentsInRemoteDevice(deviceId, torrentId, videoId) {
    this.setState({ loading: true });

    axios
      .put(`/api/devices/${deviceId}/torrents/${torrentId}/videos/${videoId}`)
      .then((response) => {
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
    this._loadVideos(viewItem.id);
    this.setState({ viewItem });
  }

  _closeModal() {
    this.setState({ viewItem: undefined });
  }

  _renderTorrents(items) {
    return (
      <ListGroup>
        {items.map((item) => (
          <ListGroupItem>
            <ListGroupItemHeading>{item.name}</ListGroupItemHeading>
            <ListGroupItemText>
              <Progress striped value={item.downloadedPerentage * 100}>
                {item.downloaded} ({item.downloadSpeed}b/s)
              </Progress>

              <ButtonGroup className="mt-3">
                <Button color="success" onClick={() => this._openModal(item)}>
                  Render
                </Button>
                <Button color="danger" onClick={() => this._remove(item.id)}>
                  Delete
                </Button>
              </ButtonGroup>
            </ListGroupItemText>
          </ListGroupItem>
        ))}
      </ListGroup>
    );
  }

  _renderSearchItems(items) {
    return (
      <ListGroup>
        {items.map((item) => (
          <ListGroupItem className="justify-content-between">
            {item.name} ({item.provider} - {item.size})
            <Button color="success" onClick={() => this._add(item.magnetUri)}>
              Add
            </Button>
          </ListGroupItem>
        ))}
      </ListGroup>
    );
  }

  _renderModal(viewItem) {
    if (viewItem) {
      const toggle = this._closeModal.bind(this);
      const { devices, loadingDevices, videos, loadingVideos } = this.state;
      let deviceId;
      let videoId;

      return (
        <Modal isOpen={true} fade={false} toggle={toggle}>
          <ModalHeader toggle={toggle}>View {viewItem.name}</ModalHeader>
          <ModalBody>
            <Form>
              <FormGroup>
                <Label for="device">Device</Label>
                {loadingDevices ? (
                  <div>Loading...</div>
                ) : (
                  <CustomInput
                    type="select"
                    name="device"
                    onChange={(e) => (deviceId = e.target.value)}
                  >
                    <option>--</option>
                    {devices.map((device) => (
                      <option value={device.id}>{device.name}</option>
                    ))}
                    <option value="browser">Browser</option>
                  </CustomInput>
                )}{" "}
                <Button
                  color="warning"
                  onClick={() => this._loadDevices()}
                  disabled={loadingDevices}
                >
                  Refresh
                </Button>
              </FormGroup>
              <FormGroup>
                <Label for="video">Video</Label>
                {loadingVideos ? (
                  <div>Loading...</div>
                ) : (
                  <CustomInput
                    type="select"
                    name="video"
                    onChange={(e) => (videoId = e.target.value)}
                  >
                    <option>--</option>
                    {videos.map((video) => (
                      <option value={video.id}>{video.name}</option>
                    ))}
                  </CustomInput>
                )}
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onClick={() =>
                this._renderTorrentsInDevice(deviceId, viewItem.id, videoId)
              }
            >
              Render
            </Button>{" "}
            <Button color="secondary" onClick={toggle}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      );
    } else {
      return null;
    }
  }

  _renderBrowserPlayer(video) {
    if (!video) {
      return null;
    }

    const videoJsOptions = {
      autoplay: true,
      controls: true,
      sources: [
        {
          src: video.url,
          type: video.contentType,
        },
      ],
    };
    const toggle = this._closeBrowserPlayer.bind(this);

    return (
      <Modal isOpen={true} fade={false} toggle={toggle}>
        <ModalHeader toggle={toggle}>{video.name}</ModalHeader>
        <ModalBody>
          <VideoPlayer {...videoJsOptions} />
        </ModalBody>
      </Modal>
    );
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
    } = this.state;
    return (
      <div>
        <SearchForm
          value={searchQ}
          onChangeSearch={this._onChangeSearch.bind(this)}
        />
        {loading || loadingSearch ? (
          <Loading />
        ) : searchItems ? (
          this._renderSearchItems(searchItems)
        ) : (
          this._renderTorrents(items)
        )}
        {this._renderModal(viewItem)}
        {this._renderBrowserPlayer(playerVideo)}
      </div>
    );
  }
}

export default ListTorrentsPage;
