export const config = {
  baseUrl:
    (process.env.SCHEMA || "http://") +
    (process.env.HOST || "localhost") +
    (process.env.PORT || "9090") +
    (process.env.BASE_PATH || ""),
  cors: process.env.CORS === "true",
  dataFolder: process.env.DATA_FOLDER || "/tmp",
  theMovieDbApiKey: process.env.TMDB_API_KEY || "",
  theTvDbApiKey: process.env.TTVDB_API_KEY || "",
};
