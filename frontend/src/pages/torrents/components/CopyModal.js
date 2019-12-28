import copy from "copy-to-clipboard";
import React from "react";
import {
  Button,
  CustomInput,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";

import { findAllTorrentVideos } from "../../../services/torrentsService";
import { isCancelError } from "../../../utils/serviceUtils";

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
      .catch((error) => {
        if (!isCancelError(error)) {
          alert(error.message);
          console.error(error);
          this.setState({ loadingVideos: false, videos: [] });
        }
      });
  }

  _onVideoChange(e) {
    const value = e.target.value;

    this.setState({
      selectedVideo: this.state.videos.filter((v) => v.id === value)[0],
    });
  }

  _copy() {
    copy(this.state.selectedVideo.url);
  }

  render() {
    const { toggle, torrent, submit } = this.props;
    const { loadingVideos, videos, selectedVideo } = this.state;

    return (
      <Modal isOpen={true} fade={false} toggle={toggle}>
        <ModalHeader toggle={toggle}>View {torrent.name}</ModalHeader>
        <ModalBody>
          <Form>
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

            <FormGroup>
              <InputGroup>
                <Input
                  readonly
                  value={selectedVideo ? selectedVideo.url : ""}
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

export default CopyModal;
