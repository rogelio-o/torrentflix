import { IMovie } from "../entity/IMovie";

export interface IMoviesRepository {
  create(movie: IMovie): Promise<void>;

  update(movie: IMovie): Promise<void>;

  delete(movieId: string): Promise<void>;

  findAll(offset: number, limit: number): Promise<IMovie[]>;

  count(): Promise<number>;

  findById(movieId: string): Promise<IMovie>;
}
