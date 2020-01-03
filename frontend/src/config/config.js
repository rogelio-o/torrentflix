const calcUrlParts = () => {
  const url = window.location.href;
  const urlParts = url.split("/");
  const baseUrl = urlParts[0] + "//" + urlParts[2];

  const baseUrlParts = baseUrl.split("://");
  const schema = baseUrlParts[0] + "://";
  const baseUrlWithoutSchema = baseUrlParts[1];

  const baseUrlWithoutSchemaAndPort = baseUrlWithoutSchema.split(":");
  const port = baseUrlWithoutSchemaAndPort[1] || "80";
  const host = baseUrlWithoutSchemaAndPort[0];

  return {
    schema,
    host,
    port,
  };
};

const parsePort = (port) => {
  return port === "80" ? "" : ":" + port;
};

const defaultBaseUrl = calcUrlParts();
const schema = process.env.REACT_APP_SCHEMA || defaultBaseUrl.schema;
const host = process.env.REACT_APP_HOST || defaultBaseUrl.host;
const port = parsePort(process.env.REACT_APP_PORT || defaultBaseUrl.port);
const basePath = process.env.REACT_APP_BASE_PATH || "";

export default {
  baseUrl: schema + host + port + basePath,
  ws: (schema === "https://" ? "wss://" : "ws://") + host + port + basePath,
};
