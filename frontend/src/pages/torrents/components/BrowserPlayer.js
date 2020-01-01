import React from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

import VideoPlayer from "../../../components/VideoPlayer";

const transformContentType = (contentType) => {
  if (contentType === "video/x-mkv" || contentType === "video/x-matroska") {
    return "video/webm";
  } else {
    return contentType;
  }
};

const BrowserPlayer = ({ toggle, video }) => {
  const videoJsOptions = {
    autoplay: true,
    sources: [
      {
        src: video.url,
        type: transformContentType(video.contentType),
      },
    ],
  };

  return (
    <Modal isOpen={true} fade={false} toggle={toggle} size="xl">
      <ModalHeader toggle={toggle}>{video.name}</ModalHeader>
      <ModalBody>
        <VideoPlayer {...videoJsOptions} />
      </ModalBody>
    </Modal>
  );
};

export default BrowserPlayer;
