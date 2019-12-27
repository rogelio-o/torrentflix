import { IMovieAdded } from "../../entity/events/IMovieAdded";
import { IMovieRefreshed } from "../../entity/events/IMovieRefreshed";
import { IMovieRemoved } from "../../entity/events/IMovieRemoved";
import { IMovieWatchedUpdated } from "../../entity/events/IMovieWatchedUpdated";
import { IApiMovieSearchResult } from "../../entity/IApiMovieSearchResult";
import { IMovie } from "../../entity/IMovie";
import { IPage } from "../../entity/IPage";
import { IPageRequest } from "../../entity/IPageRequest";
import { IMoviesRepository } from "../../repositories/IMoviesRepository";
import { IEventEmitterInstance } from "../events/IEventEmitter";
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

  public async create(
    eventEmitterInstance: IEventEmitterInstance,
    externalReferenceId: string,
  ): Promise<IMovie> {
    const movie = await this.apiMoviesService.findById(externalReferenceId);
    await this.moviesRepository.create(movie);
    eventEmitterInstance.add(this.buildMovieAdded(movie));

    return movie;
  }

  public async refresh(
    eventEmitterInstance: IEventEmitterInstance,
    movieId: string,
  ): Promise<IMovie> {
    const movie = await this.moviesRepository.findById(movieId);
    const newMovie = await this.apiMoviesService.findById(
      movie.externalReferenceId,
    );
    newMovie.id = movie.id;
    newMovie.watched = movie.watched;

    await this.moviesRepository.update(newMovie);
    eventEmitterInstance.add(this.buildMovieRefreshed(newMovie));

    return newMovie;
  }

  public async delete(
    eventEmitterInstance: IEventEmitterInstance,
    movieId: string,
  ): Promise<void> {
    await this.moviesRepository.delete(movieId);
    eventEmitterInstance.add(this.buildMovieRemoved(movieId));
  }

  public findById(movieId: string): Promise<IMovie> {
    return this.moviesRepository.findById(movieId);
  }

  public async findPage(request: IPageRequest): Promise<IPage<IMovie>> {
    const offset = request.page * request.itemsPerPage;

    let items;
    let total;

    if (request.filterWatched === undefined) {
      if (request.q) {
        [items, total] = await Promise.all([
          this.moviesRepository.findAllWithTitleLike(
            request.q,
            offset,
            request.itemsPerPage,
            request.order,
          ),
          this.moviesRepository.countWithTitleLike(request.q),
        ]);
      } else {
        [items, total] = await Promise.all([
          this.moviesRepository.findAll(
            offset,
            request.itemsPerPage,
            request.order,
          ),
          this.moviesRepository.count(),
        ]);
      }
    } else {
      if (request.q) {
        [items, total] = await Promise.all([
          this.moviesRepository.findAllByWatchedWithTitleLike(
            request.filterWatched,
            request.q,
            offset,
            request.itemsPerPage,
            request.order,
          ),
          this.moviesRepository.countWithTitleLike(request.q),
        ]);
      } else {
        [items, total] = await Promise.all([
          this.moviesRepository.findAllByWatched(
            request.filterWatched,
            offset,
            request.itemsPerPage,
            request.order,
          ),
          this.moviesRepository.count(),
        ]);
      }
    }

    return {
      currentPage: request.page,
      items,
      itemsPerPage: request.itemsPerPage,
      numItems: total,
      totalPages: Math.ceil(total / request.itemsPerPage),
    };
  }

  public async updateWatched(
    eventEmitterInstance: IEventEmitterInstance,
    movieId: string,
    watched: boolean,
  ): Promise<void> {
    await this.moviesRepository.updateWatched(movieId, watched);
    eventEmitterInstance.add(this.buildMovieWatchedUpdated(movieId, watched));
  }

  private buildMovieAdded(movie: IMovie): IMovieAdded {
    return {
      emittedOn: new Date(),
      event: "movie-added",
      movieId: movie.id || "",
    };
  }

  private buildMovieRefreshed(movie: IMovie): IMovieRefreshed {
    return {
      emittedOn: new Date(),
      event: "movie-refreshed",
      movieId: movie.id || "",
    };
  }

  private buildMovieRemoved(movieId: string): IMovieRemoved {
    return {
      emittedOn: new Date(),
      event: "movie-removed",
      movieId: movieId || "",
    };
  }

  private buildMovieWatchedUpdated(
    movieId: string,
    watched: boolean,
  ): IMovieWatchedUpdated {
    return {
      emittedOn: new Date(),
      event: "movie-watched-updated",
      movieId,
      watched,
    };
  }
}
