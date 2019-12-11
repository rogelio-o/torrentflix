import { IDevice } from "../entity/IDevice";

export interface IDevicesService {
  loadDevices(): Promise<void>;

  getDevices(): Promise<IDevice[]>;

  getDevice(deviceID: string): Promise<IDevice>;
}
