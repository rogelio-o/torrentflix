import { RenderizationStatus } from "../IRenderization";
import { IEvent } from "./IEvent";

export interface IRenderizationStatusUpdated extends IEvent {
  renderizationId: string;

  oldStatus: RenderizationStatus;

  newStatus: RenderizationStatus;

  event: "renderization-status-updated";
}
