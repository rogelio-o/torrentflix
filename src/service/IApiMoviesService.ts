import { IApiMovieSearchResult } from "../entity/IApiMovieSearchResult";
import { IMovie } from "../entity/IMovie";

export interface IApiMoviesService {
  search(q: string): Promise<IApiMovieSearchResult[]>;

  findById(externalReferenceId: string): Promise<IMovie>;
}
