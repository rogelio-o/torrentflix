import { IEvent } from "./IEvent";

export interface IMovieRefreshed extends IEvent {
  movieId: string;

  event: "movie-refreshed";
}
