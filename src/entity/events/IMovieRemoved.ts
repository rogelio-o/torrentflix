import { IEvent } from "./IEvent";

export interface IMovieRemoved extends IEvent {
  movieId: string;

  event: "movie-removed";
}
