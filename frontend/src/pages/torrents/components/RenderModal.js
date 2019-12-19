import axios from "axios";
import React from "react";
import { Button, CustomInput, Form, FormGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

class RenderModal extends React.Component {
  _sourceDevices = axios.CancelToken.source();

  constructor(props) {
    super(props);

    this.state = {
      devices: [],
      loadingDevices: false,
      loadingVideos: false,
      videos: [],
      selectedDevice: undefined,
      selectedVideo: undefined,
    };
  }

  componentDidMount() {
    const { torrent } = this.props;

    this._loadVideos(torrent.id);
    this._loadDevices();
  }

  _cancelRequestDevices() {
    this._sourceDevices.cancel();
    this._sourceDevices = axios.CancelToken.source();
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

  _onDeviceChange(e) {
    const value = e.target.value;

    if (value === "browser") {
      this.setState({ selectedDevice: { id: "browser" } });
    } else {
      this.setState({
        selectedDevice: this.state.devices.filter((d) => d.id === value)[0],
      });
    }
  }

  _onVideoChange(e) {
    const value = e.target.value;

    this.setState({
      selectedVideo: this.state.videos.filter((v) => v.id === value)[0],
    });
  }

  render() {
    const { toggle, torrent, submit } = this.props;
    const {
      devices,
      loadingDevices,
      loadingVideos,
      videos,
      selectedVideo,
      selectedDevice,
    } = this.state;

    return (
      <Modal isOpen={true} fade={false} toggle={toggle}>
        <ModalHeader toggle={toggle}>View {torrent.name}</ModalHeader>
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
                  onChange={this._onDeviceChange.bind(this)}
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
                  onChange={this._onVideoChange.bind(this)}
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
            onClick={() => submit(selectedDevice, torrent, selectedVideo)}
          >
            Render
          </Button>{" "}
          <Button color="secondary" onClick={toggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default RenderModal;
