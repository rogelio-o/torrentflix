import axios from "axios";

let source = axios.CancelToken.source();

const cancelRequest = () => {
  source.cancel();
  source = axios.CancelToken.source();
};

export const attachToDeviceATorrentVideo = (deviceId, torrentId, videoId) =>
  axios.put(`/api/devices/${deviceId}/torrents/${torrentId}/videos/${videoId}`);

export const findAllDevices = () => {
  cancelRequest();

  return axios.get("/api/devices", {
    cancelToken: source.token,
  });
};
