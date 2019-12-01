import { IVideo } from "../../common/entity/IVideo";
import { ITorrentDownloadData } from "./entity/ITorrendDonloadData";

export interface ITorrentService {
  createServer(magnetURI: string): Promise<number>;

  destroyServer(serverID: number): Promise<void>;

  findAllVideos(serverID: number): Promise<IVideo[]>;

  findVideoById(serverID: number, videoID: number): Promise<IVideo>;

  on(serverID: number, action: TorrentAction, callback: () => void): void;

  getDownloadData(serverID: number): ITorrentDownloadData;
}

export enum TorrentAction {
  DOWNLOAD,
  DONE,
  NO_PEERS,
}
