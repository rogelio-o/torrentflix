import { IEvent } from "./IEvent";

export interface ISerieAdded extends IEvent {
  serieId: string;

  event: "serie-added";
}
