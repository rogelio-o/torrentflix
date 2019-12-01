import { Server } from "http";
import { Torrent } from "webtorrent";

import { IVideo } from "../../../../common/entity/IVideo";

export interface IWebTorrentServer {
  server: Server;

  torrent: Torrent;

  videos: IVideo[];
}
