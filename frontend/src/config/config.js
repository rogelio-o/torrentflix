export default {
  baseUrl:
    (process.env.SCHEMA || "http://") +
    (process.env.HOST || "localhost") +
    (process.env.PORT || "9090") +
    (process.env.BASE_PATH || ""),
  ws:
    (process.env.SCHEMA || "ws://") +
    (process.env.HOST || "localhost") +
    (process.env.PORT || "9090") +
    (process.env.BASE_PATH || ""),
};
