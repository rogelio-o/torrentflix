import { IEvent } from "./IEvent";

export interface IDeviceAdded extends IEvent {
  deviceId: string;

  event: "device-added";
}
