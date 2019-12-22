import React from "react";
import { Button, ButtonGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText, Progress } from "reactstrap";

const formatTime = (seconds) => {
  let h = 0;
  let m = 0;
  let s = 0;
  h = Math.floor((seconds - h * 0 - m * 0) / 3600);
  m = Math.floor((seconds - h * 3600 - m * 0) / 60);
  s = Math.floor(seconds - h * 3600 - m * 60);

  const pad = (v) => {
    return v < 10 ? "0" + v : v;
  };

  return [pad(h), pad(m), pad(s)].join(":");
};

class Item extends React.Component {
  _onTimeBarClick(e, item) {
    if (item.duration) {
      const position =
        (e.nativeEvent.offsetX - e.target.offsetLeft) / e.target.offsetWidth;
      const seekSeconds = item.duration * position;

      this.props.seek(item.id, seekSeconds);
    }
  }

  render() {
    const { item, play, stop, pause } = this.props;

    return (
      <ListGroupItem>
        <ListGroupItemHeading>
          {item.deviceID} - {item.torrentID} - {item.videoID}
        </ListGroupItemHeading>
        <ListGroupItemText>
          <Progress
            striped
            value={(item.position / item.duration) * 100}
            onClick={(e) => this._onTimeBarClick(e, item)}
          >
            {formatTime(item.position)} / {formatTime(item.duration)}
          </Progress>

          <ButtonGroup className="mt-3">
            {item.status !== 2 ? (
              <Button color="warning" onClick={() => pause(item.id)}>
                Pause
              </Button>
            ) : null}
            {item.status !== 1 ? (
              <Button color="danger" onClick={() => stop(item.id)}>
                Stop
              </Button>
            ) : null}
            {item.status !== 0 ? (
              <Button color="success" onClick={() => play(item.id)}>
                Play
              </Button>
            ) : null}
          </ButtonGroup>
        </ListGroupItemText>
      </ListGroupItem>
    );
  }
}

export default Item;
