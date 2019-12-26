import { IEvent } from "./IEvent";

export interface ITorrentDownloadDataUpdated extends IEvent {
  torrentId: string;

  downloaded: number;

  downloadedPerentage: number;

  downloadSpeed: number;

  event: "torrent-download-data-updated";
}
