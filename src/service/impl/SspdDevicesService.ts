import SsdpClient from "node-ssdp";
import uuidv4 from "uuid/v4";

import { IDevice } from "../../entity/IDevice";
import { IDevicesService } from "../IDevicesService";

export class SspdDevicesService implements IDevicesService {
  private data: { [id: string]: IDevice } = {};

  public loadDevices(): Promise<void> {
    const ssdpClient = new SsdpClient.Client();
    this.data = {};
    ssdpClient.on("response", (headers: { [key: string]: string }) => {
      const deviceId = uuidv4();
      this.data[deviceId] = {
        id: deviceId,
        name: headers.SERVER,
        xmlUrl: headers.LOCATION,
      };
    });

    return ssdpClient.search("urn:schemas-upnp-org:device:MediaRenderer:1");
  }

  public getDevices(): Promise<IDevice[]> {
    return Promise.resolve(Object.values(this.data));
  }

  public getDevice(deviceID: string): Promise<IDevice> {
    return Promise.resolve(this.data[deviceID]);
  }
}
