import { IEvent } from "./IEvent";

export interface ISerieRemoved extends IEvent {
  serieId: string;

  event: "serie-removed";
}
