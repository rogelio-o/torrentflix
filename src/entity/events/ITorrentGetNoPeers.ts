import { IEvent } from "./IEvent";

export interface ITorrentGetNoPeers extends IEvent {
  torrentId: string;

  event: "torrent-get-no-peers";
}
