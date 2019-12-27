import { IEvent } from "./IEvent";

export interface ISerieRefreshed extends IEvent {
  serieId: string;

  event: "serie-refreshed";
}
