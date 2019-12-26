import * as express from "express";

import { logger } from "../config/logger";
import { IEventEmitter } from "../service/events/IEventEmitter";
import { IDevicesService } from "../service/IDevicesService";
import { IPlayerService } from "../service/IPlayerService";

export class DevicesHandler {
  private eventEmitter: IEventEmitter;

  private devicesService: IDevicesService;

  private playerService: IPlayerService;

  constructor(
    eventEmitter: IEventEmitter,
    devicesService: IDevicesService,
    playerService: IPlayerService,
  ) {
    this.eventEmitter = eventEmitter;
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
    const eventEmitterInstance = this.eventEmitter.instance();
    this.playerService
      .attach(
        eventEmitterInstance,
        req.params.deviceID,
        req.params.torrentID,
        req.params.videoID,
      )
      .then(() => {
        eventEmitterInstance.emit();

        res.sendStatus(204);
      })
      .catch((e) => {
        logger.error(e);
        res.sendStatus(500);
      });
  }
}
