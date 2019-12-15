import { IApiSerieSearchResult } from "../entity/IApiSerieSearchResult";
import { ISerie } from "../entity/ISerie";
import { ISerieWithSeasons } from "../entity/ISerieWithSeasons";

export interface ISeriesService {
  search(q: string): Promise<IApiSerieSearchResult[]>;

  create(externalReferenceId: string): Promise<ISerieWithSeasons>;

  refresh(serieId: string): Promise<ISerieWithSeasons>;

  delete(serieId: string): Promise<void>;

  findById(serieId: string): Promise<ISerieWithSeasons>;

  findAll(): Promise<ISerie[]>;
}
