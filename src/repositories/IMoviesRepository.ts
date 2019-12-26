import { IEntityOrder } from "../entity/IEntityOrder";
import { IMovie } from "../entity/IMovie";

export interface IMoviesRepository {
  create(movie: IMovie): Promise<void>;

  update(movie: IMovie): Promise<void>;

  delete(movieId: string): Promise<void>;

  findAll(
    offset: number,
    limit: number,
    order?: IEntityOrder,
  ): Promise<IMovie[]>;

  findAllWithTitleLike(
    q: string,
    offset: number,
    limit: number,
    order?: IEntityOrder,
  ): Promise<IMovie[]>;

  findAllByWatched(
    watched: boolean,
    offset: number,
    limit: number,
    order?: IEntityOrder,
  ): Promise<IMovie[]>;

  findAllByWatchedWithTitleLike(
    watched: boolean,
    q: string,
    offset: number,
    limit: number,
    order?: IEntityOrder,
  ): Promise<IMovie[]>;

  count(): Promise<number>;

  countWithTitleLike(q: string): Promise<number>;

  countByWatched(watched: boolean): Promise<number>;

  countByWatchedWithTitleLike(watched: boolean, q: string): Promise<number>;

  findById(movieId: string): Promise<IMovie>;

  updateWatched(movieId: string, watched: boolean): Promise<void>;
}
