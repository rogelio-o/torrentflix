import { IEvent } from "./IEvent";

export interface ITorrentRemoved extends IEvent {
  torrentId: string;

  event: "torrent-removed";
}
