export interface IMovie {
  id?: string;

  externalReferenceId: string;

  title: string;

  genres: string[];

  popularity: number;

  voteAverage: number;

  voteCount: number;

  originalLanguage: string;

  description: string;

  poster: string;

  backdrop: string;

  releaseDate: Date;

  duration: number;

  watched: boolean;
}
