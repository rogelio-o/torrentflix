import { IEvent } from "./IEvent";

export interface IMovieAdded extends IEvent {
  movieId: string;

  event: "movie-added";
}
