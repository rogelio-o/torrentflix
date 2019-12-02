import SsdpClient from "node-ssdp";

import { IDevice } from "../../entity/IDevice";
import { IDevicesService } from "../IDevicesService";

export class SspdDevicesService implements IDevicesService {
  private data: IDevice[] = [];

  public loadDevices(): Promise<void> {
    const ssdpClient = new SsdpClient.Client();
    this.data = [];
    let deviceIndex = 0;
    ssdpClient.on("response", (headers: { [key: string]: string }) => {
      const deviceId = deviceIndex++;
      this.data.push({
        id: deviceId,
        name: headers.SERVER,
        xmlUrl: headers.LOCATION,
      });
    });

    return ssdpClient.search("urn:schemas-upnp-org:device:MediaRenderer:1");
  }

  public getDevices(): Promise<IDevice[]> {
    return Promise.resolve(this.data);
  }

  public getDevice(deviceID: number): Promise<IDevice> {
    return Promise.resolve(this.data[deviceID]);
  }
}
