import { ITorrent } from "../entity/ITorren";
import { ITorrentRow } from "../entity/ITorrentRow";
import { IVideo } from "../entity/IVideo";
import { IEventEmitterInstance } from "./events/IEventEmitter";

export interface ITorrentService {
  createFromMagnet(
    eventEmitterInstance: IEventEmitterInstance,
    magnetURI: string,
  ): Promise<ITorrent>;

  createFromRow(
    eventEmitterInstance: IEventEmitterInstance,
    torrentRow: ITorrentRow,
  ): Promise<ITorrent>;

  remove(
    eventEmitterInstance: IEventEmitterInstance,
    torrentID: string,
  ): Promise<void>;

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
