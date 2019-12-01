import { IVideo } from "../../../../common/entity/IVideo";

export interface ITorrentStreamFile {
  video: IVideo;

  file: TorrentStream.TorrentFile;
}
