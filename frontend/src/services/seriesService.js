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
  axios.put(`${config.baseUrl}/api/series/${id}/refresh`);

export const removeSerie = (id) =>
  axios.delete(`${config.baseUrl}/api/series/${id}`);

export const createSerie = (externalReferenceId) =>
  axios.post(`${config.baseUrl}/api/series`, { externalReferenceId });

export const findAllSeries = (page, q) => {
  cancelRequest();

  return axios.get(`${config.baseUrl}/api/series`, {
    cancelToken: source.token,
    params: {
      page,
      order: "name",
      q,
      itemsPerPage: 12,
    },
  });
};

export const findAllSeriesNotWatched = (page, q) => {
  cancelRequestNotWatched();

  return axios.get(`${config.baseUrl}/api/series`, {
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
  axios.get(`${config.baseUrl}/api/series/${id}`);

export const updateSerieEpisodeWatched = (
  serieId,
  seasonNumber,
  episodeNumber,
  watched,
) =>
  axios.put(
    `${config.baseUrl}/api/series/${serieId}/S${seasonNumber}-E${episodeNumber}/watched`,
    { watched },
  );

export const searchSerie = (q) => {
  cancelRequestSearch();

  return axios.get(`${config.baseUrl}/api/series/search`, {
    cancelToken: sourceSearch.token,
    params: {
      q,
    },
  });
};
