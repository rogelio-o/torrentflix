import { IEvent } from "./IEvent";

export interface IMovieWatchedUpdated extends IEvent {
  movieId: string;

  watched: boolean;

  event: "movie-watched-updated";
}
