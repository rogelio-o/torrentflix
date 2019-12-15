import * as express from "express";

import { IMoviesService } from "../service/IMoviesService";

export class MoviesHandler {
  private moviesService: IMoviesService;

  constructor(moviesService: IMoviesService) {
    this.moviesService = moviesService;
  }

  public search(req: express.Request, res: express.Response): void {
    this.moviesService
      .search(req.query.q)
      .then((result) => res.json(result))
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  }

  public create(req: express.Request, res: express.Response): void {
    const body = req.body;
    this.moviesService
      .create(body.externalReferenceId)
      .then((result) => res.json(result))
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  }

  public refresh(req: express.Request, res: express.Response): void {
    this.moviesService
      .refresh(req.params.movieId)
      .then((result) => res.json(result))
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  }

  public delete(req: express.Request, res: express.Response): void {
    this.moviesService
      .delete(req.params.movieId)
      .then(() => res.end())
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  }

  public findById(req: express.Request, res: express.Response): void {
    this.moviesService
      .findById(req.params.movieId)
      .then((result) => res.json(result))
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  }

  public findAll(req: express.Request, res: express.Response): void {
    this.moviesService
      .findAll()
      .then((result) => res.json(result))
      .catch((e) => {
        console.error(e);
        res.sendStatus(500);
      });
  }
}