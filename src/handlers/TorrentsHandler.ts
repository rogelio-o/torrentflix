import * as express from "express";

import { ITorrentService } from "../service/ITorrentService";

export class TorrentsHandler {
  private torrentService: ITorrentService;

  constructor(torrentService: ITorrentService) {
    this.torrentService = torrentService;
  }

  public add(req: express.Request, res: express.Response) {
    const body = req.body;

    this.torrentService
      .createServer(body.magnet_uri)
      .then(() => res.sendStatus(201))
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  }
}
