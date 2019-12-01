import { IDevice } from "../../common/entity/IDevice";

export interface IDevicesService {
  loadDevices(): Promise<void>;

  getDevices(): Promise<IDevice[]>;

  getDevice(deviceID: number): Promise<IDevice>;
}
