import { IDevice } from "../entity/IDevice";
import { IEventEmitterInstance } from "./events/IEventEmitter";

export interface IDevicesService {
  startWatchingDevices(
    eventEmitterInstance: IEventEmitterInstance,
  ): Promise<void>;

  getDevices(): Promise<IDevice[]>;

  getDevice(deviceID: string): Promise<IDevice>;
}
