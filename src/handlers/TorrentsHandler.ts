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
      .load(body.magnet_uri)
      .then(() => res.sendStatus(201))
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  }

  public remove(req: express.Request, res: express.Response) {
    this.torrentService
      .remove(parseInt(req.params.torrentID, 10))
      .then(() => res.sendStatus(204))
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  }

  public findAll(req: express.Request, res: express.Response) {
    this.torrentService
      .findAll()
      .then((torrents) => res.json(torrents))
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  }

  public findById(req: express.Request, res: express.Response) {
    this.torrentService
      .findById(parseInt(req.params.torrentID, 10))
      .then((torrent) => res.json(torrent))
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  }
}