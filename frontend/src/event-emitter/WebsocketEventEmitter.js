import React from "react";
import { connect } from "react-redux";

import config from "../config/config";
import { openAlert } from "../redux/actions";
import { errorHandling } from "../utils/serviceUtils";
import eventEmitter from "./eventEmitter";

class WebsocketEventEmitter extends React.Component {
  ws = new WebSocket(config.ws);

  componentDidMount() {
    this._loadWebsocket();
  }

  _loadWebsocket() {
    this.ws.onerror = (error) => errorHandling(this.props.openAlert, error);

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const eventName = message.event || "default";
      eventEmitter.emit(`websocket.${eventName}`, message);
    };

    this.ws.onopen = () => console.log("WebSocket connected!");
  }

  render() {
    return <div>{this.props.children}</div>;
  }
}

export default connect(null, { openAlert })(WebsocketEventEmitter);
