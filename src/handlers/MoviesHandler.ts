import * as express from "express";

import { logger } from "../config/logger";
import { Direction } from "../entity/IEntityOrder";
import { IEventEmitter } from "../service/events/IEventEmitter";
import { IMoviesService } from "../service/IMoviesService";

export class MoviesHandler {
  private eventEmitter: IEventEmitter;

  private moviesService: IMoviesService;

  constructor(eventEmitter: IEventEmitter, moviesService: IMoviesService) {
    this.eventEmitter = eventEmitter;
    this.moviesService = moviesService;
  }

  public search(req: express.Request, res: express.Response): void {
    this.moviesService
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

    this.moviesService
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

    this.moviesService
      .refresh(eventEmitterInstance, req.params.movieId)
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

    this.moviesService
      .delete(eventEmitterInstance, req.params.movieId)
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
    this.moviesService
      .findById(req.params.movieId)
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

    this.moviesService
      .findPage({ page, itemsPerPage, order, q, filterWatched })
      .then((result) => res.json(result))
      .catch((e) => {
        logger.error(e);
        res.sendStatus(500);
      });
  }

  public updateWatched(req: express.Request, res: express.Response): void {
    const eventEmitterInstance = this.eventEmitter.instance();
    const movieId = req.params.movieId;
    const body = req.body;

    this.moviesService
      .updateWatched(eventEmitterInstance, movieId, body.watched)
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
