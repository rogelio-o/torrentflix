import { IDevice } from "../entity/IDevice";

export interface IDevicesService {
  startWatchingDevices(): Promise<void>;

  getDevices(): Promise<IDevice[]>;

  getDevice(deviceID: string): Promise<IDevice>;
}
