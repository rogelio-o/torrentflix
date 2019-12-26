import * as express from "express";

import { logger } from "../config/logger";
import { ITorrentSearchService, TorrentSearchCategory } from "../service/ITorrentSearchService";

export class TorrentsSearchHandler {
  private torrentsSearchService: ITorrentSearchService;

  constructor(torrentsSearchService: ITorrentSearchService) {
    this.torrentsSearchService = torrentsSearchService;
  }

  public search(req: express.Request, res: express.Response): void {
    const q = req.query.q;
    const category = req.query.category;

    this.torrentsSearchService
      .search(q, this.mapCategory(category), 10)
      .then((results) => res.json(results))
      .catch((e) => {
        logger.error(e);
        res.sendStatus(500);
      });
  }

  private mapCategory(category: string): TorrentSearchCategory {
    switch (category) {
      case "movie":
        return TorrentSearchCategory.MOVIE;
      case "tv":
        return TorrentSearchCategory.TV;
      case "all":
      default:
        return TorrentSearchCategory.ALL;
    }
  }
}
