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

const devicesService: IDevicesService = new SspdDevicesService();
const torrentService: ITorrentService = new WebTorrentService(
  process.env.TORRENT_HOST || "http://192.168.0.15",
  process.env.TORRENT_PORT_RANGE_START
    ? parseInt(process.env.TORRENT_PORT_RANGE_START, 10)
    : 9090,
);
const renderService: IRenderService = new UpnpMediaRendererService();
const playerService: IPlayerService = new PlayerServiceImpl(
  devicesService,
  torrentService,
  renderService,
);
// require("events").EventEmitter.defaultMaxListeners = 0;

devicesService.loadDevices().then(() => {
  torrentService.createServer(magnetURI).then((torrentServerID) => {
    playerService.load(0, torrentServerID, 0);
  });
});
