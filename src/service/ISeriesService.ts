import { IApiSerieSearchResult } from "../entity/IApiSerieSearchResult";
import { IPage } from "../entity/IPage";
import { IPageRequest } from "../entity/IPageRequest";
import { ISerie } from "../entity/ISerie";
import { ISerieWithSeasons } from "../entity/ISerieWithSeasons";
import { IEventEmitterInstance } from "./events/IEventEmitter";

export interface ISeriesService {
  search(q: string): Promise<IApiSerieSearchResult[]>;

  create(
    eventEmitterInstance: IEventEmitterInstance,
    externalReferenceId: string,
  ): Promise<ISerieWithSeasons>;

  refresh(
    eventEmitterInstance: IEventEmitterInstance,
    serieId: string,
  ): Promise<ISerieWithSeasons>;

  delete(
    eventEmitterInstance: IEventEmitterInstance,
    serieId: string,
  ): Promise<void>;

  findById(serieId: string): Promise<ISerieWithSeasons>;

  findPage(request: IPageRequest): Promise<IPage<ISerie>>;

  updateEpisodeWatched(
    eventEmitterInstance: IEventEmitterInstance,
    serieId: string,
    seasonNumber: number,
    episodeNumber: number,
    watched: boolean,
  ): Promise<void>;
}
