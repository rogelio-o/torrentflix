import Sspd from "node-ssdp";

import { IDeviceAdded } from "../../entity/events/IDeviceAdded";
import { IDeviceRemoved } from "../../entity/events/IDeviceRemoved";
import { DeviceType, IDevice } from "../../entity/IDevice";
import { IEventEmitterInstance } from "../events/IEventEmitter";
import { IDevicesService } from "../IDevicesService";

const MEDIA_RENDERER_TYPE = "urn:schemas-upnp-org:device:MediaRenderer:1";
const MEDIA_RENDERER_TYPE_CHROMECAST =
  "urn:dial-multiscreen-org:service:dial:1";
const THIS_SSPD_SERVER = "node-ssdp/4.0.0";

const checkDevice = (
  headers: { [key: string]: string },
  callback: (deviceId: string, type: string) => void,
) => {
  const parts = headers.USN.split("::");
  if (
    (parts[1] === MEDIA_RENDERER_TYPE ||
      parts[1] === MEDIA_RENDERER_TYPE_CHROMECAST) &&
    (!headers.SERVER || headers.SERVER.indexOf(THIS_SSPD_SERVER) === -1)
  ) {
    const deviceId = parts[0].split(":")[1];
    callback(deviceId, parts[1]);
  }
};

const parseType = (type: string): DeviceType => {
  if (type === MEDIA_RENDERER_TYPE_CHROMECAST) {
    return DeviceType.CHROMECAST;
  } else {
    return DeviceType.DLNA;
  }
};

export class SspdDevicesService implements IDevicesService {
  private data: { [id: string]: IDevice } = {};

  private server?: any;

  public startWatchingDevices(
    eventEmitterInstance: IEventEmitterInstance,
  ): Promise<void> {
    if (this.server) {
      this.server.stop();
    }

    this.server = new Sspd.Server();
    this.server.addUSN(MEDIA_RENDERER_TYPE);
    this.data = {};

    const client = new Sspd.Client();
    client.on("response", (headers: { [key: string]: string }) => {
      checkDevice(headers, (deviceId, type) => {
        const device: IDevice = {
          id: deviceId,
          name: headers.SERVER,
          type: parseType(type),
          xmlUrl: headers.LOCATION,
        };
        this.data[deviceId] = device;
        eventEmitterInstance.addAndEmit(this.buildDeviceAdded(device));
      });
    });
    client.search("ssdp:all");

    this.server.on("advertise-alive", (headers: { [key: string]: string }) => {
      checkDevice(headers, (deviceId, type) => {
        const device: IDevice = {
          id: deviceId,
          name: headers.SERVER,
          type: parseType(type),
          xmlUrl: headers.LOCATION,
        };
        this.data[deviceId] = device;
        eventEmitterInstance.addAndEmit(this.buildDeviceAdded(device));
      });
    });

    this.server.on("advertise-bye", (headers: { [key: string]: string }) => {
      checkDevice(headers, (deviceId, type) => {
        const device = this.data[deviceId];
        if (device) {
          delete this.data[deviceId];
          eventEmitterInstance.addAndEmit(this.buildDeviceRemoved(device));
        }
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

  private buildDeviceAdded(device: IDevice): IDeviceAdded {
    return {
      deviceId: device.id,
      emittedOn: new Date(),
      event: "device-added",
    };
  }

  private buildDeviceRemoved(device: IDevice): IDeviceRemoved {
    return {
      deviceId: device.id,
      emittedOn: new Date(),
      event: "device-removed",
    };
  }
}
