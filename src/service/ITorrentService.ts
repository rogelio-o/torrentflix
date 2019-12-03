import { ITorrent } from "../entity/ITorren";
import { IVideo } from "../entity/IVideo";

export interface ITorrentService {
  load(magnetURI: string): Promise<number>;

  remove(torrentID: number): Promise<void>;

  findAllVideos(torrentID: number): Promise<IVideo[]>;

  findVideoById(torrentID: number, videoID: number): Promise<IVideo>;

  startDownload(torrentID: number, videoID: number): void;

  on(torrentID: number, action: TorrentAction, callback: () => void): void;

  findAll(): Promise<ITorrent[]>;

  findById(torrentID: number): Promise<ITorrent>;
}

export enum TorrentAction {
  DOWNLOAD,
  DONE,
  NO_PEERS,
}
