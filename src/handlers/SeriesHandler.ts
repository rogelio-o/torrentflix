import * as express from "express";

import { logger } from "../config/logger";
import { Direction } from "../entity/IEntityOrder";
import { IEventEmitter } from "../service/events/IEventEmitter";
import { ISeriesService } from "../service/ISeriesService";

export class SeriesHandler {
  private eventEmitter: IEventEmitter;

  private seriesService: ISeriesService;

  constructor(eventEmitter: IEventEmitter, seriesService: ISeriesService) {
    this.eventEmitter = eventEmitter;
    this.seriesService = seriesService;
  }

  public search(req: express.Request, res: express.Response): void {
    this.seriesService
      .search(req.query.q)
      .then((result) => res.json(result))
      .catch((e) => {
        logger.error(e);
        res.sendStatus(500);
      });
  }

  public create(req: express.Request, res: express.Response): void {
    const eventEmitterInstance = this.eventEmitter.instance();
    const body = req.body;

    this.seriesService
      .create(eventEmitterInstance, body.externalReferenceId)
      .then((result) => {
        eventEmitterInstance.emit();
        res.json(result);
      })
      .catch((e) => {
        logger.error(e);
        res.sendStatus(500);
      });
  }

  public refresh(req: express.Request, res: express.Response): void {
    const eventEmitterInstance = this.eventEmitter.instance();

    this.seriesService
      .refresh(eventEmitterInstance, req.params.serieId)
      .then((result) => {
        eventEmitterInstance.emit();
        res.json(result);
      })
      .catch((e) => {
        logger.error(e);
        res.sendStatus(500);
      });
  }

  public delete(req: express.Request, res: express.Response): void {
    const eventEmitterInstance = this.eventEmitter.instance();

    this.seriesService
      .delete(eventEmitterInstance, req.params.serieId)
      .then(() => {
        eventEmitterInstance.emit();
        res.end();
      })
      .catch((e) => {
        logger.error(e);
        res.sendStatus(500);
      });
  }

  public findById(req: express.Request, res: express.Response): void {
    this.seriesService
      .findById(req.params.serieId)
      .then((result) => res.json(result))
      .catch((e) => {
        logger.error(e);
        res.sendStatus(500);
      });
  }

  public findPage(req: express.Request, res: express.Response): void {
    const page = req.query.page ? parseInt(req.query.page, 10) : 0;
    const itemsPerPage = req.query.itemsPerPage
      ? parseInt(req.query.itemsPerPage, 10)
      : 10;
    const order = req.query.order && {
      attribute: req.query.order,
      direction: req.query.orderDirection || 1 ? Direction.ASC : Direction.DESC,
    };
    const q = req.query.q;
    const filterWatched = req.query.filter_watched
      ? req.query.filter_watched === "true"
      : undefined;

    this.seriesService
      .findPage({ page, itemsPerPage, order, q, filterWatched })
      .then((result) => res.json(result))
      .catch((e) => {
        logger.error(e);
        res.sendStatus(500);
      });
  }

  public updateEpisodeWatched(
    req: express.Request,
    res: express.Response,
  ): void {
    const eventEmitterInstance = this.eventEmitter.instance();
    const serieId = req.params.serieId;
    const seasonNumber = parseInt(req.params.seasonNumber, 10);
    const episodeNumber = parseInt(req.params.episodeNumber, 10);
    const body = req.body;

    this.seriesService
      .updateEpisodeWatched(
        eventEmitterInstance,
        serieId,
        seasonNumber,
        episodeNumber,
        body.watched,
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
