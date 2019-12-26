import { IEvent } from "./IEvent";

export interface IRenderizationLoaded extends IEvent {
  renderizationId: string;

  event: "renderization-loaded";
}
