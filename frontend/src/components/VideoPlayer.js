import "video.js/dist/video-js.css";

import React from "react";
import videojs from "video.js";

export default class VideoPlayer extends React.Component {
  componentDidMount() {
    this.player = videojs(this.videoNode, {
      ...this.props,
      controls: true,
      fill: true,
    });
  }

  componentWillUnmount() {
    if (this.player) {
      this.player.dispose();
    }
  }

  render() {
    return (
      <div style={{ paddingTop: "56.5%", position: "relative" }}>
        <div
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          data-vjs-player
        >
          <video
            ref={(node) => (this.videoNode = node)}
            className="video-js"
          ></video>
        </div>
      </div>
    );
  }
}
