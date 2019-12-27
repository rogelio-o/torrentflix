import { IEvent } from "./IEvent";

export interface IDeviceRemoved extends IEvent {
  deviceId: string;

  event: "device-removed";
}
