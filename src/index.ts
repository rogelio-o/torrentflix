import express from "express";

import { PlayerServiceImpl } from "./common/service/impl/PlayerServiceImpl";
import { IPlayerService } from "./common/service/IPlayerService";
import { IDevicesService } from "./device/service/IDevicesService";
import { SspdDevicesService } from "./device/service/ssdp/SspdDevicesService";
import { IRenderService } from "./renderer/IRenderService";
import { UpnpMediaRendererService } from "./renderer/upnp-mediarenderer/UpnpMediarendererService";
import { ITorrentService } from "./torrent/services/ITorrentService";
import { WebTorrentService } from "./torrent/services/webtorrent/WebTorrentService";

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
