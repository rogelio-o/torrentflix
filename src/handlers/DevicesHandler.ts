import * as express from "express";

import { logger } from "../config/logger";
import { IDevicesService } from "../service/IDevicesService";
import { IPlayerService } from "../service/IPlayerService";

export class DevicesHandler {
  private devicesService: IDevicesService;

  private playerService: IPlayerService;

  constructor(devicesService: IDevicesService, playerService: IPlayerService) {
    this.devicesService = devicesService;
    this.playerService = playerService;
  }

  public findAll(req: express.Request, res: express.Response) {
    this.devicesService
      .getDevices()
      .then((devices) => res.json(devices))
      .catch((e) => {
        logger.error(e);
        res.sendStatus(500);
      });
  }

  public attach(req: express.Request, res: express.Response) {
    this.playerService
      .attach(req.params.deviceID, req.params.torrentID, req.params.videoID)
      .then(() => res.sendStatus(204))
      .catch((e) => {
        logger.error(e);
        res.sendStatus(500);
      });
  }
}
