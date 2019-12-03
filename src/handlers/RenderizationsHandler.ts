import * as express from "express";

import { IRenderService } from "../service/IRenderService";

export class RenderizationsHandler {
  private renderService: IRenderService;

  constructor(renderService: IRenderService) {
    this.renderService = renderService;
  }

  public findAll(req: express.Request, res: express.Response) {
    this.renderService
      .findAll()
      .then((renderization) => res.json(renderization))
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  }

  public findById(req: express.Request, res: express.Response) {
    this.renderService
      .findById(parseInt(req.params.renderizationID, 10))
      .then((renderization) => res.json(renderization))
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  }

  public stop(req: express.Request, res: express.Response) {
    this.renderService
      .stop(parseInt(req.params.renderizationID, 10))
      .then(() => res.sendStatus(204))
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  }

  public play(req: express.Request, res: express.Response) {
    this.renderService
      .play(parseInt(req.params.renderizationID, 10))
      .then(() => res.sendStatus(204))
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  }

  public pause(req: express.Request, res: express.Response) {
    this.renderService
      .pause(parseInt(req.params.renderizationID, 10))
      .then(() => res.sendStatus(204))
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  }

  public autoplay(req: express.Request, res: express.Response) {
    const body = req.body;

    this.renderService
      .autoplay(parseInt(req.params.renderizationID, 10), body.autoplay)
      .then(() => res.sendStatus(204))
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  }
}
