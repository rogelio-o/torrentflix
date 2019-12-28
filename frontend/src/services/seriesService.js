import axios from "axios";

let source = axios.CancelToken.source();
let sourceSearch = axios.CancelToken.source();

const cancelRequest = () => {
  source.cancel();
  source = axios.CancelToken.source();
};

const cancelRequestSearch = () => {
  sourceSearch.cancel();
  sourceSearch = axios.CancelToken.source();
};

export const refreshSerie = (id) => axios.put(`/api/series/${id}/refresh`);

export const removeSerie = (id) => axios.delete(`/api/series/${id}`);

export const createSerie = (externalReferenceId) =>
  axios.post("/api/series", { externalReferenceId });

export const findAllSeries = (page, q) => {
  cancelRequest();

  return axios.get("/api/series", {
    cancelToken: source.token,
    params: {
      page,
      order: "name",
      q,
    },
  });
};

export const findSerieById = (id) => axios.get(`/api/series/${id}`);

export const updateSerieEpisodeWatched = (
  serieId,
  seasonNumber,
  episodeNumber,
  watched,
) =>
  axios.put(
    `/api/series/${serieId}/S${seasonNumber}-E${episodeNumber}/watched`,
    { watched },
  );

export const searchSerie = (q) => {
  cancelRequestSearch();

  return axios.get("/api/series/search", {
    cancelToken: sourceSearch.token,
    params: {
      q,
    },
  });
};
