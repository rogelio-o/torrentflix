import { IEntityOrder } from "../entity/IEntityOrder";
import { ISerie } from "../entity/ISerie";
import { ISerieWithSeasons } from "../entity/ISerieWithSeasons";

export interface ISeriesRepository {
  findById(serieId: string): Promise<ISerieWithSeasons>;

  findAll(
    offset: number,
    limit: number,
    order?: IEntityOrder,
  ): Promise<ISerie[]>;

  findAllWithNameLike(
    q: string,
    offset: number,
    limit: number,
    order?: IEntityOrder,
  ): Promise<ISerie[]>;

  count(): Promise<number>;

  countWithNameLike(q: string): Promise<number>;

  create(serie: ISerieWithSeasons): Promise<void>;

  update(serie: ISerieWithSeasons): Promise<void>;

  delete(serieId: string): Promise<void>;
}
