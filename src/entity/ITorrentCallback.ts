import { TorrentAction } from "../service/ITorrentService";

export interface ITorrentCallback {
  action: TorrentAction;

  callback: () => void;
}
