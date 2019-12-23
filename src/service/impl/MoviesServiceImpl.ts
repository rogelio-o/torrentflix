import { IApiMovieSearchResult } from "../../entity/IApiMovieSearchResult";
import { IMovie } from "../../entity/IMovie";
import { IPage } from "../../entity/IPage";
import { IPageRequest } from "../../entity/IPageRequest";
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

  public async findPage(request: IPageRequest): Promise<IPage<IMovie>> {
    const offset = request.page * request.itemsPerPage;

    const [items, total] = await Promise.all(
      request.q
        ? [
            this.moviesRepository.findAllWithTitleLike(
              request.q,
              offset,
              request.itemsPerPage,
              request.order,
            ),
            this.moviesRepository.countWithTitleLike(request.q),
          ]
        : [
            this.moviesRepository.findAll(
              offset,
              request.itemsPerPage,
              request.order,
            ),
            this.moviesRepository.count(),
          ],
    );

    return {
      currentPage: request.page,
      items,
      itemsPerPage: request.itemsPerPage,
      numItems: total,
      totalPages: Math.ceil(total / request.itemsPerPage),
    };
  }
}
