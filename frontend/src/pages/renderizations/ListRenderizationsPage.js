import "./ListRenderizationsPage.css";

import React from "react";
import { connect } from "react-redux";
import { Container } from "reactstrap";

import Loading from "../../components/Loading";
import eventEmitter from "../../event-emitter/eventEmitter";
import { openAlert } from "../../redux/actions";
import {
  findAllRenderizations,
  pauseRenderization,
  playRenderization,
  seekRenderization,
  stopRenderization,
} from "../../services/renderizationsService";
import { errorHandling } from "../../utils/serviceUtils";
import Items from "./components/Items";

const mapResponseDataToItems = (data) => {
  const result = {};
  data.forEach((obj) => (result[obj.id] = obj));
  return result;
};

class ListRenderizationsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      items: {},
    };
  }

  componentDidMount() {
    this._load();
    this._listenUpdates();
  }

  componentWillUnmount() {
    this._unlistenUpdates();
  }

  _listenUpdates() {
    this._renderizationPositionUpdatedSubscription = eventEmitter.on(
      "websocket.renderization-position-updated",
      (event) => {
        const items = this.state.items;
        const item = items[event.renderizationId];
        if (item) {
          item.position = event.position;
          item.duration = event.duration;

          this.setState({ items });
        }
      },
    );

    this._renderizationStatusUpdatedSubscription = eventEmitter.on(
      "websocket.renderization-status-updated",
      (event) => {
        const items = this.state.items;
        const item = items[event.renderizationId];
        if (item) {
          item.status = event.newStatus;

          this.setState({ items });
        }
      },
    );
  }

  _unlistenUpdates() {
    if (this._renderizationPositionUpdatedSubscription) {
      this._renderizationPositionUpdatedSubscription.unsubscribe();
    }
    if (this._renderizationStatusUpdatedSubscription) {
      this._renderizationStatusUpdatedSubscription.unsubscribe();
    }
  }

  _stop(id) {
    this._action(stopRenderization(id));
  }

  _pause(id) {
    this._action(pauseRenderization(id));
  }

  _play(id) {
    this._action(playRenderization(id));
  }

  _seek(id, seconds) {
    this._action(seekRenderization(id, seconds));
  }

  _action(requestPromise) {
    this.setState({ loading: true });
    requestPromise
      .then(() => this._load())
      .catch((error) =>
        errorHandling(this.props.openAlert, error, () =>
          this.setState({ loading: false }),
        ),
      );
  }

  _load() {
    this.setState({ loading: true });
    findAllRenderizations()
      .then((response) => {
        this.setState({
          loading: false,
          items: mapResponseDataToItems(response.data),
        });
      })
      .catch((error) =>
        errorHandling(this.props.openAlert, error, () =>
          this.setState({ loading: false, items: {} }),
        ),
      );
  }

  render() {
    const { loading, items } = this.state;

    return (
      <Container className="list-renderizations-page">
        {loading ? (
          <Loading />
        ) : (
          <Items
            items={Object.values(items)}
            stop={this._stop.bind(this)}
            pause={this._pause.bind(this)}
            play={this._play.bind(this)}
            seek={this._seek.bind(this)}
          />
        )}
      </Container>
    );
  }
}

export default connect(null, { openAlert })(ListRenderizationsPage);
