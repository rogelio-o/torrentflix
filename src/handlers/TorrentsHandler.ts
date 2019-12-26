import * as express from "express";

import { logger } from "../config/logger";
import { IEventEmitter } from "../service/events/IEventEmitter";
import { ITorrentService } from "../service/ITorrentService";

export class TorrentsHandler {
  private eventEmitter: IEventEmitter;

  private torrentService: ITorrentService;

  constructor(eventEmitter: IEventEmitter, torrentService: ITorrentService) {
    this.eventEmitter = eventEmitter;
    this.torrentService = torrentService;
  }

  public add(req: express.Request, res: express.Response) {
    const body = req.body;
    const eventEmitterInstance = this.eventEmitter.instance();

    this.torrentService
      .createFromMagnet(eventEmitterInstance, body.magnet_uri)
      .then(() => {
        eventEmitterInstance.emit();
        res.sendStatus(201);
      })
      .catch((e) => {
        logger.error(e);
        res.sendStatus(500);
      });
  }

  public remove(req: express.Request, res: express.Response) {
    const eventEmitterInstance = this.eventEmitter.instance();

    this.torrentService
      .remove(eventEmitterInstance, req.params.torrentID)
      .then(() => {
        eventEmitterInstance.emit();
        res.sendStatus(204);
      })
      .catch((e) => {
        logger.error(e);
        res.sendStatus(500);
      });
  }

  public findAll(req: express.Request, res: express.Response) {
    this.torrentService
      .findAll()
      .then((torrents) => res.json(torrents))
      .catch((e) => {
        logger.error(e);
        res.sendStatus(500);
      });
  }

  public findById(req: express.Request, res: express.Response) {
    this.torrentService
      .findById(req.params.torrentID)
      .then((torrent) => res.json(torrent))
      .catch((e) => {
        logger.error(e);
        res.sendStatus(500);
      });
  }
}
