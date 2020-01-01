import axios from "axios";

import config from "../config/config";

let source = axios.CancelToken.source();

const cancelRequest = () => {
  source.cancel();
  source = axios.CancelToken.source();
};

export const attachToDeviceATorrentVideo = (deviceId, torrentId, videoId) =>
  axios.put(
    `${config.host}/api/devices/${deviceId}/torrents/${torrentId}/videos/${videoId}`,
  );

export const findAllDevices = () => {
  cancelRequest();

  return axios.get(`${config.host}/api/devices`, {
    cancelToken: source.token,
  });
};
