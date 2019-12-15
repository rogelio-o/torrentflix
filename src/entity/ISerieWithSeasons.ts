import { ISerie } from "./ISerie";
import { ISerieSeason } from "./ISerieSeason";

export interface ISerieWithSeasons extends ISerie {
  seasons: ISerieSeason[];
}
