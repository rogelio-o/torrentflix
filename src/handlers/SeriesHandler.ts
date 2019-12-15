import * as express from "express";

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

  public findAll(req: express.Request, res: express.Response): void {
    this.seriesService
      .findAll()
      .then((result) => res.json(result))
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  }
}
