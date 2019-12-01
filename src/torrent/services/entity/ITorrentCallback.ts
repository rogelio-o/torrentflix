import { TorrentAction } from "../ITorrentService";

export interface ITorrentCallback {
  action: TorrentAction;

  callback: () => void;
}
