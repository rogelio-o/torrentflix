import { IApiMovieSearchResult } from "../entity/IApiMovieSearchResult";
import { IMovie } from "../entity/IMovie";
import { IPage } from "../entity/IPage";
import { IPageRequest } from "../entity/IPageRequest";

export interface IMoviesService {
  search(q: string): Promise<IApiMovieSearchResult[]>;

  create(externalReferenceId: string): Promise<IMovie>;

  refresh(movieId: string): Promise<IMovie>;

  delete(movieId: string): Promise<void>;

  findById(movieId: string): Promise<IMovie>;

  findPage(request: IPageRequest): Promise<IPage<IMovie>>;
}
