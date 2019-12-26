import { IEvent } from "./IEvent";

export interface ITorrentAdded extends IEvent {
  torrentId: string;

  event: "torrent-added";
}
