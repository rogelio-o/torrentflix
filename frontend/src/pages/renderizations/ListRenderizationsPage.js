import axios from "axios";
import React from "react";

import Loading from "../../components/Loading";
import Items from "./components/Items";

class ListRenderizationsPage extends React.Component {
  _source = axios.CancelToken.source();

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

  _cancelRequest() {
    this._source.cancel();
    this._source = axios.CancelToken.source();
  }

  _stop(id) {
    this._action(id, "stop");
  }

  _pause(id) {
    this._action(id, "pause");
  }

  _play(id) {
    this._action(id, "play");
  }

  _seek(id, seconds) {
    this._action(id, "seek", {
      seconds,
    });
  }

  _action(id, action, body) {
    this.setState({ loading: true });
    axios
      .put(`/api/renderizations/${id}/${action}`, body)
      .then(() => this._load())
      .catch((error) => {
        alert(error.message);
        console.error(error);
        this.setState({ loading: false });
      });
  }

  _load() {
    this._cancelRequest();

    this.setState({ loading: true });
    axios
      .get("/api/renderizations", {
        cancelToken: this._source.token,
      })
      .then((response) => {
        this.setState({
          loading: false,
          items: response.data,
        });
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
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
