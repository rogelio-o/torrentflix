import axios from "axios";

import config from "../config/config";

let source = axios.CancelToken.source();
let sourceSearch = axios.CancelToken.source();
let sourceVideos = axios.CancelToken.source();

const cancelRequest = () => {
  source.cancel();
  source = axios.CancelToken.source();
};

const cancelRequestSearch = () => {
  sourceSearch.cancel();
  sourceSearch = axios.CancelToken.source();
};

const cancelRequestVideos = () => {
  sourceVideos.cancel();
  sourceVideos = axios.CancelToken.source();
};

export const createTorrentFromMagnet = (magnetURI) =>
  axios.post(`${config.host}/api/torrents`, { magnet_uri: magnetURI });

export const removeTorrent = (id) =>
  axios.delete(`${config.host}/api/torrents/${id}`);

export const findAllTorrents = () => {
  cancelRequest();
  return axios.get(`${config.host}/api/torrents`, {
    cancelToken: source.token,
  });
};

export const searchTorrent = (q) => {
  cancelRequestSearch();

  return axios.get(`${config.host}/api/torrents/search`, {
    params: { q },
    cancelToken: sourceSearch.token,
  });
};

export const findAllTorrentVideos = (torrentId) => {
  cancelRequestVideos();

  return axios.get(`${config.host}/api/torrents/${torrentId}/videos`, {
    cancelToken: sourceVideos.token,
  });
};
