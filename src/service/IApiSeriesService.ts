import { IApiSerieSearchResult } from "../entity/IApiSerieSearchResult";
import { ISerieWithSeasons } from "../entity/ISerieWithSeasons";

export interface IApiSeriesService {
  search(q: string): Promise<IApiSerieSearchResult[]>;

  findById(externalReferenceId: string): Promise<ISerieWithSeasons>;
}
