import { IEvent } from "./IEvent";

export interface ISerieEpisodeWatchedUpdated extends IEvent {
  serieId: string;

  watched: boolean;

  event: "serie-episode-watched-updated";

  seasonNumber: number;

  episodeNumber: number;
}
