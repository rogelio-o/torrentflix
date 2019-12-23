import * as express from "express";

import { Direction } from "../entity/IEntityOrder";
import { ISeriesService } from "../service/ISeriesService";

export class SeriesHandler {
  private seriesService: ISeriesService;

  constructor(seriesService: ISeriesService) {
    this.seriesService = seriesService;
  }

  public search(req: express.Request, res: express.Response): void {
    this.seriesService
      .search(req.query.q)
      .then((result) => res.json(result))
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  }

  public create(req: express.Request, res: express.Response): void {
    const body = req.body;
    this.seriesService
      .create(body.externalReferenceId)
      .then((result) => res.json(result))
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  }

  public refresh(req: express.Request, res: express.Response): void {
    this.seriesService
      .refresh(req.params.serieId)
      .then((result) => res.json(result))
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  }

  public delete(req: express.Request, res: express.Response): void {
    this.seriesService
      .delete(req.params.serieId)
      .then(() => res.end())
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  }

  public findById(req: express.Request, res: express.Response): void {
    this.seriesService
      .findById(req.params.serieId)
      .then((result) => res.json(result))
      .catch((e) => {
        console.error(e);
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

    this.seriesService
      .findPage({ page, itemsPerPage, order, q })
      .then((result) => res.json(result))
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  }
}
