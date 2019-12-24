import { IApiSerieSearchResult } from "../entity/IApiSerieSearchResult";
import { IPage } from "../entity/IPage";
import { IPageRequest } from "../entity/IPageRequest";
import { ISerie } from "../entity/ISerie";
import { ISerieWithSeasons } from "../entity/ISerieWithSeasons";

export interface ISeriesService {
  search(q: string): Promise<IApiSerieSearchResult[]>;

  create(externalReferenceId: string): Promise<ISerieWithSeasons>;

  refresh(serieId: string): Promise<ISerieWithSeasons>;

  delete(serieId: string): Promise<void>;

  findById(serieId: string): Promise<ISerieWithSeasons>;

  findPage(request: IPageRequest): Promise<IPage<ISerie>>;

  updateEpisodeWatched(
    serieId: string,
    seasonNumber: number,
    episodeNumber: number,
    watched: boolean,
  ): Promise<void>;
}
