export default {
  host: process.env.REACT_APP_HOST || "http://localhost:9090",
  ws:
    "ws://" +
    (process.env.REACT_APP_HOST || "http://localhost:9090").replace(
      /^http:\/\//,
      "",
    ),
};
