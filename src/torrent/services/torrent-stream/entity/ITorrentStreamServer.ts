import { ITorrentStreamFile } from "./ITorrentStreamFile";

export interface ITorrentStreamServer {
  engine: TorrentStream.TorrentEngine;

  files: ITorrentStreamFile[];
}
