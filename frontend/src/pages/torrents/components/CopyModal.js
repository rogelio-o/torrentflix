import copy from "copy-to-clipboard";
import React from "react";
import { connect } from "react-redux";
import {
  Button,
  CustomInput,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";

import config from "../../../config/config";
import { openAlert } from "../../../redux/actions";
import { findAllTorrentVideos } from "../../../services/torrentsService";
import { errorHandling } from "../../../utils/serviceUtils";

const createStreamUrl = (torrent, video) => {
  return (
    config.baseUrl +
    "/api/torrent/servers/" +
    torrent.id +
    "/files/" +
    video.id +
    "/stream"
  );
};

class CopyModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loadingVideos: false,
      videos: [],
      selectedVideo: undefined,
    };
  }

  componentDidMount() {
    const { torrent } = this.props;

    this._loadVideos(torrent.id);
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

  _onVideoChange(e) {
    const value = e.target.value;

    this.setState({
      selectedVideo: this.state.videos.filter((v) => v.id === value)[0],
    });
  }

  _copy() {
    const { torrent } = this.props;
    const { selectedVideo } = this.state;
    copy(createStreamUrl(torrent, selectedVideo));
  }

  render() {
    const { toggle, torrent } = this.props;
    const { loadingVideos, videos, selectedVideo } = this.state;

    return (
      <Modal isOpen={true} fade={false} toggle={toggle}>
        <ModalHeader toggle={toggle}>View {torrent.name}</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              {loadingVideos ? (
                <div>Loading...</div>
              ) : (
                <CustomInput
                  type="select"
                  name="video"
                  id="video"
                  onChange={this._onVideoChange.bind(this)}
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

            <FormGroup>
              <InputGroup>
                <Input
                  readOnly
                  value={
                    selectedVideo ? createStreamUrl(torrent, selectedVideo) : ""
                  }
                />
                <InputGroupAddon addonType="append">
                  <Button
                    disabled={!selectedVideo}
                    onClick={this._copy.bind(this)}
                  >
                    Copy
                  </Button>
                </InputGroupAddon>
              </InputGroup>
            </FormGroup>
          </Form>
        </ModalBody>
      </Modal>
    );
  }
}

export default connect(null, { openAlert })(CopyModal);
