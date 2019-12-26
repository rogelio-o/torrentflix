import { IEvent } from "./IEvent";

export interface ITorrentDownloaded extends IEvent {
  torrentId: string;

  event: "torrent-downloaded";
}
