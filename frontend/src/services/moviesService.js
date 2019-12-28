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

export const createMovie = (externalReferenceId) =>
  axios.post("/api/movies", { externalReferenceId });

export const refreshMovie = (id) => axios.put(`/api/movies/${id}/refresh`);

export const removeMovie = (id) => axios.delete(`/api/movies/${id}`);

export const findAllMovies = async (page, q) => {
  cancelRequest();

  return await axios.get("/api/movies", {
    cancelToken: source.token,
    params: {
      page,
      order: "title",
      q,
    },
  });
};

export const findMovieById = (id) => axios.get(`/api/movies/${id}`);

export const updateMovieWatched = (id, watched) =>
  axios.put(`/api/movies/${id}/watched`, { watched });

export const searchMovie = (q) => {
  cancelRequestSearch();

  return axios.get("/api/movies/search", {
    cancelToken: sourceSearch.token,
    params: {
      q,
    },
  });
};
