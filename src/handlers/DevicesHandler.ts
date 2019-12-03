import * as express from "express";

import { IDevicesService } from "../service/IDevicesService";
import { IPlayerService } from "../service/IPlayerService";

export class DevicesHandler {
  private devicesService: IDevicesService;

  private playerService: IPlayerService;

  constructor(devicesService: IDevicesService, playerService: IPlayerService) {
    this.devicesService = devicesService;
    this.playerService = playerService;
  }

  public load(req: express.Request, res: express.Response) {
    this.devicesService
      .loadDevices()
      .then(() => res.sendStatus(204))
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  }

  public findAll(req: express.Request, res: express.Response) {
    this.devicesService
      .getDevices()
      .then((devices) => res.json(devices))
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  }

  public attach(req: express.Request, res: express.Response) {
    this.playerService
      .load(
        parseInt(req.params.deviceID, 10),
        parseInt(req.params.torrentID, 10),
        parseInt(req.params.videoID, 10),
      )
      .then(() => res.sendStatus(204))
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  }
}