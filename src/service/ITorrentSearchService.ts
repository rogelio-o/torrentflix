import { ITorrentSearchResult } from "../entity/ITorrentSearchResult";

export interface ITorrentSearchService {
  search(
    q: string,
    category: TorrentSearchCategory,
    numResults: number,
  ): Promise<ITorrentSearchResult[]>;
}

export enum TorrentSearchCategory {
  MOVIE,
  TV,
  ALL,
}
