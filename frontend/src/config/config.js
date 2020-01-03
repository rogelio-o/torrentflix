const parsePort = (port) => {
  return port === "80" ? "" : ":" + port;
};

export default {
  baseUrl:
    (process.env.SCHEMA || "http://") +
    (process.env.HOST || "localhost") +
    parsePort(process.env.PORT || "9090") +
    (process.env.BASE_PATH || ""),
  ws:
    "ws://" +
    (process.env.HOST || "localhost") +
    parsePort(process.env.PORT || "9090") +
    (process.env.BASE_PATH || ""),
};
