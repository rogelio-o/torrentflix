import Sspd from "node-ssdp";

import { IDevice } from "../../entity/IDevice";
import { IDevicesService } from "../IDevicesService";

const MEDIA_RENDERER_TYPE = "urn:schemas-upnp-org:device:MediaRenderer:1";
const THIS_SSPD_SERVER = "node-ssdp/4.0.0";

const checkDevice = (
  headers: { [key: string]: string },
  callback: (deviceId: string) => void,
) => {
  const parts = headers.USN.split("::");
  if (
    parts[1] === MEDIA_RENDERER_TYPE &&
    (!headers.SERVER || headers.SERVER.indexOf(THIS_SSPD_SERVER) === -1)
  ) {
    const deviceId = parts[0].split(":")[1];
    callback(deviceId);
  }
};

export class SspdDevicesService implements IDevicesService {
  private data: { [id: string]: IDevice } = {};

  private server?: any;

  public startWatchingDevices(): Promise<void> {
    if (this.server) {
      this.server.stop();
    }

    this.server = new Sspd.Server();
    this.server.addUSN(MEDIA_RENDERER_TYPE);

    this.data = {};
    this.server.on("advertise-alive", (headers: { [key: string]: string }) => {
      checkDevice(headers, (deviceId) => {
        this.data[deviceId] = {
          id: deviceId,
          name: headers.SERVER,
          xmlUrl: headers.LOCATION,
        };
      });
    });

    this.server.on("advertise-bye", (headers: { [key: string]: string }) => {
      checkDevice(headers, (deviceId) => {
        delete this.data[deviceId];
      });
    });

    this.server.start();

    process.on("exit", () => {
      this.server.stop();
    });

    return Promise.resolve();
  }

  public getDevices(): Promise<IDevice[]> {
    return Promise.resolve(Object.values(this.data));
  }

  public getDevice(deviceID: string): Promise<IDevice> {
    return Promise.resolve(this.data[deviceID]);
  }
}
