export interface IDevice {
  id: string;

  name: string;

  xmlUrl: string;

  type: DeviceType;
}

export enum DeviceType {
  DLNA,
  CHROMECAST,
}
