import * as cron from "cron";

import { logger } from "../../config/logger";
import { ISeriesRepository } from "../../repositories/ISeriesRepository";
import { IAutoRefreshDataService } from "../IAutoRefreshDataService";
import { ISeriesService } from "../ISeriesService";

export class AutoRefreshDataServiceImpl implements IAutoRefreshDataService {
  private seriesRepository: ISeriesRepository;

  private seriesService: ISeriesService;

  private cronTask?: cron.CronJob;

  constructor(
    seriesRepository: ISeriesRepository,
    seriesService: ISeriesService,
  ) {
    this.seriesRepository = seriesRepository;
    this.seriesService = seriesService;
  }

  public start(): void {
    this.cronTask = new cron.CronJob(
      "0 0 1 * * *",
      this.refreshSeriesData.bind(this),
      undefined,
      true,
      "Europe/Madrid",
      undefined,
      false,
    );
  }

  private refreshSeriesData() {
    logger.info("Starting refresh series task.");

    this.seriesRepository
      .findAll()
      .then((series) => {
        series.forEach((serie) =>
          this.seriesService
            .refresh(serie.id as string)
            .catch((e) => logger.error(e)),
        );
      })
      .catch((e) => logger.error(e));
  }
}
