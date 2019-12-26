import bodyParser from "body-parser";
import express from "express";
import * as http from "http";
import path from "path";
import sqlite from "sqlite";
import * as WebSocket from "ws";

import { logger } from "./config/logger";
import { DevicesHandler } from "./handlers/DevicesHandler";
import { MoviesHandler } from "./handlers/MoviesHandler";
import { RenderizationsHandler } from "./handlers/RenderizationsHandler";
import { SeriesHandler } from "./handlers/SeriesHandler";
import { TorrentsHandler } from "./handlers/TorrentsHandler";
import { TorrentsSearchHandler } from "./handlers/TorrentsSearchHandler";
import { TorrentsVideosHandler } from "./handlers/TorrentsVideosHandler";
import { IMoviesRepository } from "./repositories/IMoviesRepository";
import { ISeriesRepository } from "./repositories/ISeriesRepository";
import { ITorrentRepository } from "./repositories/ITorrentRepository";
import { SqliteMoviesRepository } from "./repositories/sqlite/SqliteMoviesRepository";
import { SqliteSeriesRepository } from "./repositories/sqlite/SqliteSeriesRepository";
import { SqliteTorrentRepository } from "./repositories/sqlite/SqliteTorrentRepository";
import { IEventEmitter } from "./service/events/IEventEmitter";
import { WsEventEmitter } from "./service/events/impl/WsEventEmitter";
import { IApiMoviesService } from "./service/IApiMoviesService";
import { IApiSeriesService } from "./service/IApiSeriesService";
import { IAutoRefreshDataService } from "./service/IAutoRefreshDataService";
import { IDevicesService } from "./service/IDevicesService";
import { IMoviesService } from "./service/IMoviesService";
import { ApiTorrentSearchService } from "./service/impl/ApiTorrentSearchService";
import { AutoRefreshDataServiceImpl } from "./service/impl/AutoRefreshDataServiceImpl";
import { MediaRendererServiceImpl } from "./service/impl/MediarendererServiceImpl";
import { MoviesServiceImpl } from "./service/impl/MoviesServiceImpl";
import { PlayerServiceImpl } from "./service/impl/PlayerServiceImpl";
import { SeriesServiceImpl } from "./service/impl/SeriesServiceImpl";
import { SspdDevicesService } from "./service/impl/SspdDevicesService";
import { TMDBApiMoviesService } from "./service/impl/TMDBApiMoviesService";
import { TTVDBApiSeriesService } from "./service/impl/TTVDBApiSeriesService";
import { WebTorrentService } from "./service/impl/WebTorrentService";
import { IPlayerService } from "./service/IPlayerService";
import { IRenderService } from "./service/IRenderService";
import { ISeriesService } from "./service/ISeriesService";
import { ITorrentSearchService } from "./service/ITorrentSearchService";
import { ITorrentService } from "./service/ITorrentService";

require("events").EventEmitter.defaultMaxListeners = 0;

const dataFolder = process.env.DATA_FOLDER || "/tmp";
const dbPromise = Promise.resolve()
  .then(() => sqlite.open(`${dataFolder}/database.sqlite`))
  .then((db) => db.migrate({}));

const app = express();
const server = http.createServer(app);
const wsServer = new WebSocket.Server({ server });

const torrentsRepository: ITorrentRepository = new SqliteTorrentRepository(
  dbPromise,
);
const moviesRepository: IMoviesRepository = new SqliteMoviesRepository(
  dbPromise,
);
const seriesRepository: ISeriesRepository = new SqliteSeriesRepository(
  dbPromise,
);

const eventEmitter: IEventEmitter = new WsEventEmitter(wsServer);
const devicesService: IDevicesService = new SspdDevicesService();
const torrentService: ITorrentService = new WebTorrentService(
  torrentsRepository,
  dataFolder,
  process.env.HOST || "http://192.168.0.15:9090",
  app,
);
const renderService: IRenderService = new MediaRendererServiceImpl();
const playerService: IPlayerService = new PlayerServiceImpl(
  devicesService,
  torrentService,
  renderService,
);
const torrentSearchService: ITorrentSearchService = new ApiTorrentSearchService();
const apiMoviesService: IApiMoviesService = new TMDBApiMoviesService(
  process.env.TMDB_API_KEY || "",
);
const moviesService: IMoviesService = new MoviesServiceImpl(
  apiMoviesService,
  moviesRepository,
);
const apiSeriesService: IApiSeriesService = new TTVDBApiSeriesService(
  process.env.TTVDB_API_KEY || "",
);
const seriesService: ISeriesService = new SeriesServiceImpl(
  apiSeriesService,
  seriesRepository,
);
const autoRefreshDataSerivce: IAutoRefreshDataService = new AutoRefreshDataServiceImpl(
  seriesRepository,
  seriesService,
);

app.use(bodyParser.json({ type: "application/json" }));

const deviceHandler = new DevicesHandler(
  eventEmitter,
  devicesService,
  playerService,
);
app.get("/api/devices", deviceHandler.findAll.bind(deviceHandler));
app.put(
  "/api/devices/:deviceID/torrents/:torrentID/videos/:videoID",
  deviceHandler.attach.bind(deviceHandler),
);

const torrentsSearchHandler: TorrentsSearchHandler = new TorrentsSearchHandler(
  torrentSearchService,
);
app.get(
  "/api/torrents/search",
  torrentsSearchHandler.search.bind(torrentsSearchHandler),
);

const torrentsHandler = new TorrentsHandler(eventEmitter, torrentService);
app.post("/api/torrents", torrentsHandler.add.bind(torrentsHandler));
app.get("/api/torrents", torrentsHandler.findAll.bind(torrentsHandler));
app.get(
  "/api/torrents/:torrentID",
  torrentsHandler.findById.bind(torrentsHandler),
);
app.delete(
  "/api/torrents/:torrentID",
  torrentsHandler.remove.bind(torrentsHandler),
);

const torrentsVideosHandler = new TorrentsVideosHandler(torrentService);
app.get(
  "/api/torrents/:torrentID/videos",
  torrentsVideosHandler.findAll.bind(torrentsVideosHandler),
);
app.get(
  "/api/torrents/:torrentID/videos/:videoID",
  torrentsVideosHandler.findById.bind(torrentsVideosHandler),
);

const renderizationsHandler = new RenderizationsHandler(renderService);
app.get(
  "/api/renderizations",
  renderizationsHandler.findAll.bind(renderizationsHandler),
);
app.get(
  "/api/renderizations/:renderizationID",
  renderizationsHandler.findById.bind(renderizationsHandler),
);
app.put(
  "/api/renderizations/:renderizationID/stop",
  renderizationsHandler.stop.bind(renderizationsHandler),
);
app.put(
  "/api/renderizations/:renderizationID/play",
  renderizationsHandler.play.bind(renderizationsHandler),
);
app.put(
  "/api/renderizations/:renderizationID/pause",
  renderizationsHandler.pause.bind(renderizationsHandler),
);
app.put(
  "/api/renderizations/:renderizationID/seek",
  renderizationsHandler.seek.bind(renderizationsHandler),
);

const moviesHandler: MoviesHandler = new MoviesHandler(moviesService);
app.get("/api/movies/search", moviesHandler.search.bind(moviesHandler));
app.get("/api/movies", moviesHandler.findPage.bind(moviesHandler));
app.get("/api/movies/:movieId", moviesHandler.findById.bind(moviesHandler));
app.post("/api/movies", moviesHandler.create.bind(moviesHandler));
app.put(
  "/api/movies/:movieId/watched",
  moviesHandler.updateWatched.bind(moviesHandler),
);
app.put(
  "/api/movies/:movieId/refresh",
  moviesHandler.refresh.bind(moviesHandler),
);
app.delete("/api/movies/:movieId", moviesHandler.delete.bind(moviesHandler));

const seriesHandler: SeriesHandler = new SeriesHandler(seriesService);
app.get("/api/series/search", seriesHandler.search.bind(seriesHandler));
app.get("/api/series", seriesHandler.findPage.bind(seriesHandler));
app.get("/api/series/:serieId", seriesHandler.findById.bind(seriesHandler));
app.post("/api/series", seriesHandler.create.bind(seriesHandler));
app.put(
  "/api/series/:serieId/S:seasonNumber-E:episodeNumber/watched",
  seriesHandler.updateEpisodeWatched.bind(seriesHandler),
);
app.put(
  "/api/series/:serieId/refresh",
  seriesHandler.refresh.bind(seriesHandler),
);
app.delete("/api/series/:serieId", seriesHandler.delete.bind(seriesHandler));

app.use("/", express.static("frontend/build"));
app.use((req, res) => {
  res.sendFile(path.resolve("frontend/build/index.html"));
});

autoRefreshDataSerivce.start();
devicesService.startWatchingDevices().then(async () => {
  // LOAD saved torrents
  logger.info("Loading torrents...");
  const savedTorrents = await torrentsRepository.findAll();
  const eventEmitterInstance = eventEmitter.instance();
  await Promise.all(
    savedTorrents.map((savedTorrent) =>
      torrentService.createFromRow(eventEmitterInstance, savedTorrent),
    ),
  );
  eventEmitterInstance.emit();

  // LOAD server
  server.listen(9090, () =>
    logger.info(`Torrentflix listening on port ${9090}!`),
  );
  const sockets: any[] = [];
  server.on("connection", (socket) => {
    socket.setTimeout(36000000);
    const index = sockets.push(socket) - 1;
    socket.once("close", () => {
      sockets.splice(index, 1);
    });
  });
  server.on("close", () => {
    sockets.forEach((socket) => socket.destroy());
  });
});
