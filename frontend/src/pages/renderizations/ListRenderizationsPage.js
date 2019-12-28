import React from "react";

import Loading from "../../components/Loading";
import {
  findAllRenderizations,
  pauseRenderization,
  playRenderization,
  seekRenderization,
  stopRenderization,
} from "../../services/renderizationsService";
import { isCancelError } from "../../utils/serviceUtils";
import Items from "./components/Items";

class ListRenderizationsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      items: [],
    };
  }

  componentDidMount() {
    this._load();
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
      .catch((error) => {
        alert(error.message);
        console.error(error);
        this.setState({ loading: false });
      });
  }

  _load() {
    this.setState({ loading: true });
    findAllRenderizations()
      .then((response) => {
        this.setState({
          loading: false,
          items: response.data,
        });
      })
      .catch((error) => {
        if (!isCancelError(error)) {
          alert(error.message);
          console.error(error);
          this.setState({ loading: false, items: [] });
        }
      });
  }

  render() {
    const { loading, items } = this.state;

    if (loading) {
      return <Loading />;
    } else {
      return (
        <Items
          items={items}
          stop={this._stop.bind(this)}
          pause={this._pause.bind(this)}
          play={this._play.bind(this)}
          seek={this._seek.bind(this)}
        />
      );
    }
  }
}

export default ListRenderizationsPage;
