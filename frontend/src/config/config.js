const parsePort = (port) => {
  return port === "80" ? "" : ":" + port;
};

export default {
  baseUrl:
    (process.env.REACT_APP_SCHEMA || "http://") +
    (process.env.REACT_APP_HOST || "localhost") +
    parsePort(process.env.REACT_APP_PORT || "9090") +
    (process.env.REACT_APP_BASE_PATH || ""),
  ws:
    (process.env.REACT_APP_SCHEMA === "https://" ? "wss://" : "ws://") +
    (process.env.REACT_APP_HOST || "localhost") +
    parsePort(process.env.REACT_APP_PORT || "9090") +
    (process.env.REACT_APP_BASE_PATH || ""),
};
