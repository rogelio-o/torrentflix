import "./Item.css";

import React from "react";
import { FaEllipsisV, FaPause, FaPlay, FaStop } from "react-icons/fa";
import { Button, ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle, Progress } from "reactstrap";

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
  constructor(props) {
    super(props);

    this.state = {
      isOpenDropdown: false,
    };
  }

  _onTimeBarClick(e, item) {
    if (item.duration) {
      const position =
        (e.nativeEvent.offsetX - e.target.offsetLeft) / e.target.offsetWidth;
      const seekSeconds = item.duration * position;

      this.props.seek(item.id, seekSeconds);
    }
  }

  _renderMainActionBtn() {
    const { item, play, pause } = this.props;
    const action = item.status === 0 ? pause : play;
    const Icon = item.status === 0 ? FaPause : FaPlay;

    return (
      <Button
        className="renderization-play-btn"
        onClick={() => action(item.id)}
      >
        <Icon />
      </Button>
    );
  }

  render() {
    const { item, stop } = this.props;
    const { isOpenDropdown } = this.state;
    const toggleDropdown = () =>
      this.setState({ isOpenDropdown: !isOpenDropdown });

    return (
      <div className="renderization-item">
        <ButtonDropdown
          isOpen={isOpenDropdown}
          toggle={toggleDropdown}
          className="renderization-actions"
        >
          <DropdownToggle>
            <FaEllipsisV />
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem onClick={() => stop(item.id)}>
              <FaStop /> Stop
            </DropdownItem>
          </DropdownMenu>
        </ButtonDropdown>
        <div className="renderization-play">{this._renderMainActionBtn()}</div>
        <div className="renderization-data">
          <h2 className="renderization-name">{item.videoID}</h2>
          <div className="renderization-subdata">
            <span className="subdata-value">{item.torrentID}</span>
            <span className="subdata-value">{item.deviceID}</span>
          </div>
          <div className="renderization-timeline">
            <Progress
              value={(item.position / item.duration) * 100}
              onClick={(e) => this._onTimeBarClick(e, item)}
            />
            <div className="renderization-timeline-text">
              {formatTime(item.position)} / {formatTime(item.duration)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Item;
