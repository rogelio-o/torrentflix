import axios from "axios";
import React from "react";
import {
  Button,
  ButtonGroup,
  ListGroup,
  ListGroupItem,
  ListGroupItemHeading,
  ListGroupItemText,
  Progress,
} from "reactstrap";

import Loading from "../../components/Loading";

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

  _action(id, action) {
    this.setState({ loading: true });
    axios
      .put(`/api/renderizations/${id}/${action}`)
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
        <ListGroup>
          {items.map((item) => (
            <ListGroupItem>
              <ListGroupItemHeading>
                {item.deviceID} - {item.torrentID} - {item.videoID}
              </ListGroupItemHeading>
              <ListGroupItemText>
                <Progress striped value={(item.position / item.duration) * 100}>
                  {item.position} / {item.duration}
                </Progress>

                <ButtonGroup className="mt-3">
                  {item.status !== 2 ? (
                    <Button
                      color="warning"
                      onClick={() => this._pause(item.id)}
                    >
                      Pause
                    </Button>
                  ) : null}
                  {item.status !== 1 ? (
                    <Button color="danger" onClick={() => this._stop(item.id)}>
                      Stop
                    </Button>
                  ) : null}
                  {item.status !== 0 ? (
                    <Button color="success" onClick={() => this._play(item.id)}>
                      Play
                    </Button>
                  ) : null}
                </ButtonGroup>
              </ListGroupItemText>
            </ListGroupItem>
          ))}
        </ListGroup>
      );
    }
  }
}

export default ListRenderizationsPage;
