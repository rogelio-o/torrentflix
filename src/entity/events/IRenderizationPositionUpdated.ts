import { IEvent } from "./IEvent";

export interface IRenderizationPositionUpdated extends IEvent {
  renderizationId: string;

  position: number;

  duration: number;

  event: "renderization-position-updated";
}
