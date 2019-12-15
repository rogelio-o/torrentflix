import { ISerie } from "../entity/ISerie";
import { ISerieWithSeasons } from "../entity/ISerieWithSeasons";

export interface ISeriesRepository {
  findById(serieId: string): Promise<ISerieWithSeasons>;

  findAll(): Promise<ISerie[]>;

  create(serie: ISerieWithSeasons): Promise<void>;

  update(serie: ISerieWithSeasons): Promise<void>;

  delete(serieId: string): Promise<void>;
}
