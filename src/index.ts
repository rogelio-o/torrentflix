import bodyParser from "body-parser";
import express from "express";

import { DevicesHandler } from "./handlers/DevicesHandler";
import { TorrentsHandler } from "./handlers/TorrentsHandler";
import { IDevicesService } from "./service/IDevicesService";
import { PlayerServiceImpl } from "./service/impl/PlayerServiceImpl";
import { SspdDevicesService } from "./service/impl/SspdDevicesService";
import { UpnpMediaRendererService } from "./service/impl/UpnpMediarendererService";
import { WebTorrentService } from "./service/impl/WebTorrentService";
import { IPlayerService } from "./service/IPlayerService";
import { IRenderService } from "./service/IRenderService";
import { ITorrentService } from "./service/ITorrentService";

require("events").EventEmitter.defaultMaxListeners = 0;

const app = express();

const devicesService: IDevicesService = new SspdDevicesService();
const torrentService: ITorrentService = new WebTorrentService(
  process.env.DATA_FOLDER || "/tmp",
  process.env.HOST || "http://192.168.0.15:9090",
  app,
);
const renderService: IRenderService = new UpnpMediaRendererService();
const playerService: IPlayerService = new PlayerServiceImpl(
  devicesService,
  torrentService,
  renderService,
);

app.use(bodyParser.json({ type: "application/json" }));

const deviceHandler = new DevicesHandler(devicesService, playerService);
app.post("/devices/refresh", deviceHandler.load.bind(deviceHandler));
app.get("/devices", deviceHandler.findAll.bind(deviceHandler));
app.put(
  "/devices/:deviceID/torrents/:torrentID/videos/:videoID",
  deviceHandler.attach.bind(deviceHandler),
);

const torrentsHandler = new TorrentsHandler(torrentService);
app.post("/torrents", torrentsHandler.add.bind(torrentsHandler));

devicesService.loadDevices().then(() => {
  app.listen(9090, () => console.log(`Torrentflix listening on port ${9090}!`));
});
