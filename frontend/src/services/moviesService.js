import axios from "axios";

import config from "../config/config";

let source = axios.CancelToken.source();
let sourceNotWatched = axios.CancelToken.source();
let sourceSearch = axios.CancelToken.source();

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

export const createMovie = (externalReferenceId) =>
  axios.post(`${config.host}/api/movies`, { externalReferenceId });

export const refreshMovie = (id) =>
  axios.put(`${config.host}/api/movies/${id}/refresh`);

export const removeMovie = (id) =>
  axios.delete(`${config.host}/api/movies/${id}`);

export const findAllMovies = async (page, q) => {
  cancelRequest();

  return await axios.get(`${config.host}/api/movies`, {
    cancelToken: source.token,
    params: {
      page,
      order: "title",
      q,
    },
  });
};
export const findAllMoviesNotWatched = async (page, q) => {
  cancelRequestNotWatched();

  return await axios.get(`${config.host}/api/movies`, {
    cancelToken: sourceNotWatched.token,
    params: {
      page,
      order: "title",
      filter_watched: false,
      q,
    },
  });
};

export const findMovieById = (id) =>
  axios.get(`${config.host}/api/movies/${id}`);

export const updateMovieWatched = (id, watched) =>
  axios.put(`${config.host}/api/movies/${id}/watched`, { watched });

export const searchMovie = (q) => {
  cancelRequestSearch();

  return axios.get(`${config.host}/api/movies/search`, {
    cancelToken: sourceSearch.token,
    params: {
      q,
    },
  });
};
