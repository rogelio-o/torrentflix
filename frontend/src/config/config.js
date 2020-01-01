export default {
  host: process.env.HOST || "http://localhost:9090",
  ws:
    "ws://" +
    (process.env.HOST || "http://localhost:9090").replace(/^http:\/\//, ""),
};
