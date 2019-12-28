import axios from "axios";

let source = axios.CancelToken.source();

const cancelRequest = () => {
  source.cancel();
  source = axios.CancelToken.source();
};

export const playRenderization = (id) =>
  axios.put(`/api/renderizations/${id}/play`);

export const pauseRenderization = (id) =>
  axios.put(`/api/renderizations/${id}/pause`);

export const stopRenderization = (id) =>
  axios.put(`/api/renderizations/${id}/stop`);

export const seekRenderization = (id, seconds) =>
  axios.put(`/api/renderizations/${id}/seek`, { seconds });

export const findAllRenderizations = () => {
  cancelRequest();

  return axios.get("/api/renderizations", {
    cancelToken: source.token,
  });
};
