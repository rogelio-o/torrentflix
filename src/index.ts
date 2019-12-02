import express from "express";

import { IDevicesService } from "./service/IDevicesService";
import { PlayerServiceImpl } from "./service/impl/PlayerServiceImpl";
import { SspdDevicesService } from "./service/impl/SspdDevicesService";
import { UpnpMediaRendererService } from "./service/impl/UpnpMediarendererService";
import { WebTorrentService } from "./service/impl/WebTorrentService";
import { IPlayerService } from "./service/IPlayerService";
import { IRenderService } from "./service/IRenderService";
import { ITorrentService } from "./service/ITorrentService";

const magnetURI = process.env.MAGNET_URI;

if (!magnetURI) {
  throw new Error("Env variable MAGNER_URI is required.");
}

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

app.listen(9090, () => console.log(`Torrentflix listening on port ${9090}!`));

devicesService.loadDevices().then(() => {
  torrentService.createServer(magnetURI).then((torrentServerID) => {
    playerService.load(0, torrentServerID, 0);
  });
});
