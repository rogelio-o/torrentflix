export interface ISerieEpisode {
  number: number;

  name: string;

  date?: Date;

  description: string;

  voteAverage: number;

  voteCount: number;

  poster: string;

  watched: boolean;
}
