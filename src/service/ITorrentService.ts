import { ITorrent } from "../entity/ITorren";
import { ITorrentRow } from "../entity/ITorrentRow";
import { IVideo } from "../entity/IVideo";

export interface ITorrentService {
  createFromMagnet(magnetURI: string): Promise<ITorrent>;

  createFromRow(torrentRow: ITorrentRow): Promise<ITorrent>;

  remove(torrentID: string): Promise<void>;

  findAllVideos(torrentID: string): Promise<IVideo[]>;

  findVideoById(torrentID: string, videoID: string): Promise<IVideo>;

  startDownload(torrentID: string, videoID: string): void;

  on(torrentID: string, action: TorrentAction, callback: () => void): void;

  findAll(): Promise<ITorrent[]>;

  findById(torrentID: string): Promise<ITorrent>;
}

export enum TorrentAction {
  DOWNLOAD,
  DONE,
  NO_PEERS,
}
