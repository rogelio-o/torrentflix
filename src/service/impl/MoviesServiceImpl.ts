import { IApiMovieSearchResult } from "../../entity/IApiMovieSearchResult";
import { IMovie } from "../../entity/IMovie";
import { IMoviesRepository } from "../../repositories/IMoviesRepository";
import { IApiMoviesService } from "../IApiMoviesService";
import { IMoviesService } from "../IMoviesService";

export class MoviesServiceImpl implements IMoviesService {
  private apiMoviesService: IApiMoviesService;

  private moviesRepository: IMoviesRepository;

  constructor(
    apiMoviesService: IApiMoviesService,
    moviesRepository: IMoviesRepository,
  ) {
    this.apiMoviesService = apiMoviesService;
    this.moviesRepository = moviesRepository;
  }

  public search(q: string): Promise<IApiMovieSearchResult[]> {
    return this.apiMoviesService.search(q);
  }

  public async create(externalReferenceId: string): Promise<IMovie> {
    const movie = await this.apiMoviesService.findById(externalReferenceId);
    await this.moviesRepository.create(movie);

    return movie;
  }

  public async refresh(movieId: string): Promise<IMovie> {
    const movie = await this.moviesRepository.findById(movieId);
    const newMovie = await this.apiMoviesService.findById(
      movie.externalReferenceId,
    );
    newMovie.id = movie.id;
    await this.moviesRepository.update(newMovie);

    return newMovie;
  }

  public delete(movieId: string): Promise<void> {
    return this.moviesRepository.delete(movieId);
  }

  public findById(movieId: string): Promise<IMovie> {
    return this.moviesRepository.findById(movieId);
  }

  public findAll(): Promise<IMovie[]> {
    return this.moviesRepository.findAll();
  }
}
