import bodyParser from "body-parser";
import express from "express";
import sqlite from "sqlite";

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
import { IApiMoviesService } from "./service/IApiMoviesService";
import { IApiSeriesService } from "./service/IApiSeriesService";
import { IDevicesService } from "./service/IDevicesService";
import { IMoviesService } from "./service/IMoviesService";
import { ApiTorrentSearchService } from "./service/impl/ApiTorrentSearchService";
import { MoviesServiceImpl } from "./service/impl/MoviesServiceImpl";
import { PlayerServiceImpl } from "./service/impl/PlayerServiceImpl";
import { SeriesServiceImpl } from "./service/impl/SeriesServiceImpl";
import { SspdDevicesService } from "./service/impl/SspdDevicesService";
import { TMDBApiMoviesService } from "./service/impl/TMDBApiMoviesService";
import { TTVDBApiSeriesService } from "./service/impl/TTVDBApiSeriesService";
import { UpnpMediaRendererService } from "./service/impl/UpnpMediarendererService";
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

const torrentsRepository: ITorrentRepository = new SqliteTorrentRepository(
  dbPromise,
);
const moviesRepository: IMoviesRepository = new SqliteMoviesRepository(
  dbPromise,
);
const seriesRepository: ISeriesRepository = new SqliteSeriesRepository(
  dbPromise,
);

const devicesService: IDevicesService = new SspdDevicesService();
const torrentService: ITorrentService = new WebTorrentService(
  torrentsRepository,
  dataFolder,
  process.env.HOST || "http://192.168.0.15:9090",
  app,
);
const renderService: IRenderService = new UpnpMediaRendererService();
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

app.use(bodyParser.json({ type: "application/json" }));

const deviceHandler = new DevicesHandler(devicesService, playerService);
app.post("/devices/refresh", deviceHandler.load.bind(deviceHandler));
app.get("/devices", deviceHandler.findAll.bind(deviceHandler));
app.put(
  "/devices/:deviceID/torrents/:torrentID/videos/:videoID",
  deviceHandler.attach.bind(deviceHandler),
);

const torrentsSearchHandler: TorrentsSearchHandler = new TorrentsSearchHandler(
  torrentSearchService,
);
app.get(
  "/torrents/search",
  torrentsSearchHandler.search.bind(torrentsSearchHandler),
);

const torrentsHandler = new TorrentsHandler(torrentService);
app.post("/torrents", torrentsHandler.add.bind(torrentsHandler));
app.get("/torrents", torrentsHandler.findAll.bind(torrentsHandler));
app.get("/torrents/:torrentID", torrentsHandler.findById.bind(torrentsHandler));
app.delete(
  "/torrents/:torrentID",
  torrentsHandler.remove.bind(torrentsHandler),
);

const torrentsVideosHandler = new TorrentsVideosHandler(torrentService);
app.get(
  "/torrents/:torrentID/videos",
  torrentsVideosHandler.findAll.bind(torrentsVideosHandler),
);
app.get(
  "/torrents/:torrentID/videos/:videoID",
  torrentsVideosHandler.findById.bind(torrentsVideosHandler),
);

const renderizationsHandler = new RenderizationsHandler(renderService);
app.get(
  "/renderizations",
  renderizationsHandler.findAll.bind(renderizationsHandler),
);
app.get(
  "/renderizations/:renderizationID",
  renderizationsHandler.findById.bind(renderizationsHandler),
);
app.put(
  "/renderizations/:renderizationID/stop",
  renderizationsHandler.stop.bind(renderizationsHandler),
);
app.put(
  "/renderizations/:renderizationID/play",
  renderizationsHandler.play.bind(renderizationsHandler),
);
app.put(
  "/renderizations/:renderizationID/pause",
  renderizationsHandler.pause.bind(renderizationsHandler),
);
app.put(
  "/renderizations/:renderizationID/autoplay",
  renderizationsHandler.autoplay.bind(renderizationsHandler),
);
app.put(
  "/renderizations/:renderizationID/seek",
  renderizationsHandler.autoplay.bind(renderizationsHandler),
);

const moviesHandler: MoviesHandler = new MoviesHandler(moviesService);
app.get("/movies/search", moviesHandler.search.bind(moviesHandler));
app.get("/movies", moviesHandler.findAll.bind(moviesHandler));
app.get("/movies/:movieId", moviesHandler.findById.bind(moviesHandler));
app.post("/movies", moviesHandler.create.bind(moviesHandler));
app.put("/movies/:movieId/refresh", moviesHandler.refresh.bind(moviesHandler));
app.delete("/movies/:movieId", moviesHandler.delete.bind(moviesHandler));

const seriesHandler: SeriesHandler = new SeriesHandler(seriesService);
app.get("/series/search", seriesHandler.search.bind(seriesHandler));
app.get("/series", seriesHandler.findAll.bind(seriesHandler));
app.get("/series/:serieId", seriesHandler.findById.bind(seriesHandler));
app.post("/series", seriesHandler.create.bind(seriesHandler));
app.put("/series/:serieId/refresh", seriesHandler.refresh.bind(seriesHandler));
app.delete("/series/:serieId", seriesHandler.delete.bind(seriesHandler));

devicesService.loadDevices().then(async () => {
  // LOAD saved torrents
  console.log("Loading torrents...");
  const savedTorrents = await torrentsRepository.findAll();
  await Promise.all(
    savedTorrents.map((savedTorrent) =>
      torrentService.createFromRow(savedTorrent),
    ),
  );

  // LOAD server
  const server = app.listen(9090, () =>
    console.log(`Torrentflix listening on port ${9090}!`),
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
