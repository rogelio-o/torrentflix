import axios from "axios";

import config from "../config/config";

let source = axios.CancelToken.source();

const cancelRequest = () => {
  source.cancel();
  source = axios.CancelToken.source();
};

export const playRenderization = (id) =>
  axios.put(`${config.host}/api/renderizations/${id}/play`);

export const pauseRenderization = (id) =>
  axios.put(`${config.host}/api/renderizations/${id}/pause`);

export const stopRenderization = (id) =>
  axios.put(`${config.host}/api/renderizations/${id}/stop`);

export const seekRenderization = (id, seconds) =>
  axios.put(`${config.host}/api/renderizations/${id}/seek`, { seconds });

export const findAllRenderizations = () => {
  cancelRequest();

  return axios.get(`${config.host}/api/renderizations`, {
    cancelToken: source.token,
  });
};
