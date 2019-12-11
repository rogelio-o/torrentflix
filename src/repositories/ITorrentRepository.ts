import { ITorrentRow } from "../entity/ITorrentRow";

export interface ITorrentRepository {
  save(row: ITorrentRow): Promise<void>;

  findAll(): Promise<ITorrentRow[]>;

  delete(torrentID: string): Promise<void>;
}
