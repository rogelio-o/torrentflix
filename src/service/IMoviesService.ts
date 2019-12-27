import { IApiMovieSearchResult } from "../entity/IApiMovieSearchResult";
import { IMovie } from "../entity/IMovie";
import { IPage } from "../entity/IPage";
import { IPageRequest } from "../entity/IPageRequest";
import { IEventEmitterInstance } from "./events/IEventEmitter";

export interface IMoviesService {
  search(q: string): Promise<IApiMovieSearchResult[]>;

  create(
    eventEmitterInstance: IEventEmitterInstance,
    externalReferenceId: string,
  ): Promise<IMovie>;

  refresh(
    eventEmitterInstance: IEventEmitterInstance,
    movieId: string,
  ): Promise<IMovie>;

  delete(
    eventEmitterInstance: IEventEmitterInstance,
    movieId: string,
  ): Promise<void>;

  findById(movieId: string): Promise<IMovie>;

  findPage(request: IPageRequest): Promise<IPage<IMovie>>;

  updateWatched(
    eventEmitterInstance: IEventEmitterInstance,
    movieId: string,
    watched: boolean,
  ): Promise<void>;
}
