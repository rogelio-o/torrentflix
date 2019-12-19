import React from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import VideoPlayer from "video.js";

const BrowserPlayer = ({ toggle, video }) => {
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

  return (
    <Modal isOpen={true} fade={false} toggle={toggle}>
      <ModalHeader toggle={toggle}>{video.name}</ModalHeader>
      <ModalBody>
        <VideoPlayer {...videoJsOptions} />
      </ModalBody>
    </Modal>
  );
};

export default BrowserPlayer;
