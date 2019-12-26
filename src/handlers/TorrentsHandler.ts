import * as express from "express";

import { logger } from "../config/logger";
import { ITorrentService } from "../service/ITorrentService";

export class TorrentsHandler {
  private torrentService: ITorrentService;

  constructor(torrentService: ITorrentService) {
    this.torrentService = torrentService;
  }

  public add(req: express.Request, res: express.Response) {
    const body = req.body;

    this.torrentService
      .createFromMagnet(body.magnet_uri)
      .then(() => res.sendStatus(201))
      .catch((e) => {
        logger.error(e);
        res.sendStatus(500);
      });
  }

  public remove(req: express.Request, res: express.Response) {
    this.torrentService
      .remove(req.params.torrentID)
      .then(() => res.sendStatus(204))
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
