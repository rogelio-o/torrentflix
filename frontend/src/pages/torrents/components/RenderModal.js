import React from "react";
import { connect } from "react-redux";
import { Button, CustomInput, Form, FormGroup, Label, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import { openAlert } from "../../../redux/actions";
import { findAllDevices } from "../../../services/devicesService";
import { findAllTorrentVideos } from "../../../services/torrentsService";
import { errorHandling } from "../../../utils/serviceUtils";

class RenderModal extends React.Component {
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

  _loadVideos(torrentId) {
    this.setState({ loadingVideos: true });
    findAllTorrentVideos(torrentId)
      .then((response) => {
        this.setState({
          loadingVideos: false,
          videos: response.data,
        });
      })
      .catch((error) =>
        errorHandling(this.props.openAlert, error, () =>
          this.setState({ loadingVideos: false, videos: [] }),
        ),
      );
  }

  _loadDevices() {
    this.setState({ loadingDevices: true });
    findAllDevices()
      .then((response) => {
        this.setState({
          loadingDevices: false,
          devices: response.data,
        });
      })
      .catch((error) =>
        errorHandling(this.props.openAlert, error, () =>
          this.setState({ loadingDevices: false, devices: [] }),
        ),
      );
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
                  id="device"
                >
                  <option>--</option>
                  {devices.map((device, index) => (
                    <option value={device.id} key={index}>
                      {device.name}
                    </option>
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
                  id="video"
                >
                  <option>--</option>
                  {videos.map((video, index) => (
                    <option value={video.id} key={index}>
                      {video.name}
                    </option>
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

export default connect(null, { openAlert })(RenderModal);
