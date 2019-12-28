import axios from "axios";

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
  axios.post("/api/torrents", { magnet_uri: magnetURI });

export const removeTorrent = (id) => axios.delete(`/api/torrents/${id}`);

export const findAllTorrents = () => {
  cancelRequest();
  return axios.get("/api/torrents", {
    cancelToken: source.token,
  });
};

export const searchTorrent = (q) => {
  cancelRequestSearch();

  return axios.get("/api/torrents/search", {
    params: { q },
    cancelToken: sourceSearch.token,
  });
};

export const findAllTorrentVideos = (torrentId) => {
  cancelRequestVideos();

  return axios.get(`/api/torrents/${torrentId}/videos`, {
    cancelToken: sourceVideos.token,
  });
};
