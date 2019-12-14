import { IApiMovieSearchResult } from "../entity/IApiMovieSearchResult";
import { IMovie } from "../entity/IMovie";

export interface IMoviesService {
  search(q: string): Promise<IApiMovieSearchResult[]>;

  create(externalReferenceId: string): Promise<IMovie>;

  refresh(movieId: string): Promise<IMovie>;

  delete(movieId: string): Promise<void>;

  findById(movieId: string): Promise<IMovie>;

  findAll(): Promise<IMovie[]>;
}
