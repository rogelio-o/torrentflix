import axios from "axios";

import config from "../config/config";

let source = axios.CancelToken.source();
let sourceSearch = axios.CancelToken.source();
let sourceNotWatched = axios.CancelToken.source();

const cancelRequest = () => {
  source.cancel();
  source = axios.CancelToken.source();
};

const cancelRequestNotWatched = () => {
  sourceNotWatched.cancel();
  sourceNotWatched = axios.CancelToken.source();
};

const cancelRequestSearch = () => {
  sourceSearch.cancel();
  sourceSearch = axios.CancelToken.source();
};

export const refreshSerie = (id) =>
  axios.put(`${config.host}/api/series/${id}/refresh`);

export const removeSerie = (id) =>
  axios.delete(`${config.host}/api/series/${id}`);

export const createSerie = (externalReferenceId) =>
  axios.post(`${config.host}/api/series`, { externalReferenceId });

export const findAllSeries = (page, q) => {
  cancelRequest();

  return axios.get(`${config.host}/api/series`, {
    cancelToken: source.token,
    params: {
      page,
      order: "name",
      q,
    },
  });
};

export const findAllSeriesNotWatched = (page, q) => {
  cancelRequestNotWatched();

  return axios.get(`${config.host}/api/series`, {
    cancelToken: sourceNotWatched.token,
    params: {
      page,
      order: "name",
      filter_watched: false,
      q,
    },
  });
};

export const findSerieById = (id) =>
  axios.get(`${config.host}/api/series/${id}`);

export const updateSerieEpisodeWatched = (
  serieId,
  seasonNumber,
  episodeNumber,
  watched,
) =>
  axios.put(
    `${config.host}/api/series/${serieId}/S${seasonNumber}-E${episodeNumber}/watched`,
    { watched },
  );

export const searchSerie = (q) => {
  cancelRequestSearch();

  return axios.get(`${config.host}/api/series/search`, {
    cancelToken: sourceSearch.token,
    params: {
      q,
    },
  });
};
