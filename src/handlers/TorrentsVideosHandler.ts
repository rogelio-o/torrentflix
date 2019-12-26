import * as express from "express";

import { logger } from "../config/logger";
import { ITorrentService } from "../service/ITorrentService";

export class TorrentsVideosHandler {
  private torrentsService: ITorrentService;

  constructor(torrentsService: ITorrentService) {
    this.torrentsService = torrentsService;
  }

  public findAll(req: express.Request, res: express.Response) {
    this.torrentsService
      .findAllVideos(req.params.torrentID)
      .then((videos) => res.json(videos))
      .catch((e) => {
        logger.error(e);
        res.sendStatus(500);
      });
  }

  public findById(req: express.Request, res: express.Response) {
    this.torrentsService
      .findVideoById(req.params.torrentID, req.params.videoID)
      .then((video) => res.json(video))
      .catch((e) => {
        logger.error(e);
        res.sendStatus(500);
      });
  }
}
