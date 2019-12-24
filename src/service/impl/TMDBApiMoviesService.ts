import axios from "axios";

import { IApiMovieSearchResult } from "../../entity/IApiMovieSearchResult";
import { IMovie } from "../../entity/IMovie";
import { IApiMoviesService } from "../IApiMoviesService";

const DEFAULT_LANGUAGE = "en-UK";
const BASE_URL = "https://api.themoviedb.org/3";

export class TMDBApiMoviesService implements IApiMoviesService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public search(q: string): Promise<IApiMovieSearchResult[]> {
    return axios
      .get(`${BASE_URL}/search/movie`, {
        params: {
          api_key: this.apiKey,
          language: DEFAULT_LANGUAGE,
          query: q,
        },
      })
      .then((response) => {
        const data = response.data;
        return data.results.map((movie: any) => this.mapSearchResult(movie));
      });
  }

  public findById(externalReferenceId: string): Promise<IMovie> {
    return axios
      .get(`${BASE_URL}/movie/${externalReferenceId}`, {
        params: {
          api_key: this.apiKey,
          language: DEFAULT_LANGUAGE,
        },
      })
      .then((response) => {
        const data = response.data;
        return this.mapMovie(data);
      });
  }

  private mapSearchResult(movie: any): IApiMovieSearchResult {
    return {
      backdrop: movie.backdrop_path,
      description: movie.overview,
      externalReferenceId: movie.id.toString(),
      popularity: movie.popularity,
      poster: movie.poster_path,
      releaseDate: new Date(movie.release_date),
      title: movie.title,
      voteAverage: movie.vote_average,
      voteCount: movie.vote_count,
    };
  }

  private mapMovie(movie: any): IMovie {
    return {
      backdrop: movie.backdrop_path,
      description: movie.overview,
      duration: movie.runtime,
      externalReferenceId: movie.id.toString(),
      genres: movie.genres.map((genre: any) => genre.name),
      originalLanguage: movie.original_language,
      popularity: movie.popularity,
      poster: movie.poster_path,
      releaseDate: new Date(movie.release_date),
      title: movie.title,
      voteAverage: movie.vote_average,
      voteCount: movie.vote_count,
      watched: false,
    };
  }
}
