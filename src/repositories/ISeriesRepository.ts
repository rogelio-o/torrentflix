import { IEntityOrder } from "../entity/IEntityOrder";
import { ISerie } from "../entity/ISerie";
import { ISerieWithSeasons } from "../entity/ISerieWithSeasons";

export interface ISeriesRepository {
  findById(serieId: string): Promise<ISerieWithSeasons>;

  findAll(
    offset?: number,
    limit?: number,
    order?: IEntityOrder,
  ): Promise<ISerie[]>;

  findAllWithNameLike(
    q: string,
    offset?: number,
    limit?: number,
    order?: IEntityOrder,
  ): Promise<ISerie[]>;

  findAllByWatched(
    watched: boolean,
    offset?: number,
    limit?: number,
    order?: IEntityOrder,
  ): Promise<ISerie[]>;

  findAllByWatchedWithNameLike(
    watched: boolean,
    q: string,
    offset?: number,
    limit?: number,
    order?: IEntityOrder,
  ): Promise<ISerie[]>;

  count(): Promise<number>;

  countWithNameLike(q: string): Promise<number>;

  countByWatched(watched: boolean): Promise<number>;

  countByWatchedWithNameLike(watched: boolean, q: string): Promise<number>;

  create(serie: ISerieWithSeasons): Promise<void>;

  update(serie: ISerieWithSeasons): Promise<void>;

  delete(serieId: string): Promise<void>;

  updateEpisodeWatched(
    serieId: string,
    seasonNumber: number,
    episodeNumber: number,
    watched: boolean,
  ): Promise<void>;
}
