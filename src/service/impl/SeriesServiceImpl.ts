import { ISerieAdded } from "../../entity/events/ISerieAdded";
import { ISerieEpisodeWatchedUpdated } from "../../entity/events/ISerieEpisodeWatchedUpdated";
import { ISerieRefreshed } from "../../entity/events/ISerieRefreshed";
import { ISerieRemoved } from "../../entity/events/ISerieRemoved";
import { IApiSerieSearchResult } from "../../entity/IApiSerieSearchResult";
import { IPage } from "../../entity/IPage";
import { IPageRequest } from "../../entity/IPageRequest";
import { ISerie } from "../../entity/ISerie";
import { ISerieEpisode } from "../../entity/ISerieEpisode";
import { ISerieSeason } from "../../entity/ISerieSeason";
import { ISerieWithSeasons } from "../../entity/ISerieWithSeasons";
import { ISeriesRepository } from "../../repositories/ISeriesRepository";
import { IEventEmitterInstance } from "../events/IEventEmitter";
import { IApiSeriesService } from "../IApiSeriesService";
import { ISeriesService } from "../ISeriesService";

export class SeriesServiceImpl implements ISeriesService {
  private apiService: IApiSeriesService;

  private repository: ISeriesRepository;

  constructor(apiService: IApiSeriesService, repository: ISeriesRepository) {
    this.apiService = apiService;
    this.repository = repository;
  }

  public search(q: string): Promise<IApiSerieSearchResult[]> {
    return this.apiService.search(q);
  }

  public async create(
    eventEmitterInstance: IEventEmitterInstance,
    externalReferenceId: string,
  ): Promise<ISerieWithSeasons> {
    const serie = await this.apiService.findById(externalReferenceId);
    await this.repository.create(serie);
    eventEmitterInstance.add(this.buildSerieAdded(serie));

    return serie;
  }

  public async refresh(
    eventEmitterInstance: IEventEmitterInstance,
    serieId: string,
  ): Promise<ISerieWithSeasons> {
    const oldSerie = await this.repository.findById(serieId);
    const newSerie = await this.apiService.findById(
      oldSerie.externalReferenceId,
    );
    newSerie.id = oldSerie.id;
    this._addOldWatched(oldSerie, newSerie);
    await this.repository.update(newSerie);
    eventEmitterInstance.add(this.buildSerieRefreshed(newSerie));

    return newSerie;
  }

  public async delete(
    eventEmitterInstance: IEventEmitterInstance,
    serieId: string,
  ): Promise<void> {
    await this.repository.delete(serieId);
    eventEmitterInstance.add(this.buildSerieRemoved(serieId));
  }

  public findById(serieId: string): Promise<ISerieWithSeasons> {
    return this.repository.findById(serieId);
  }

  public async findPage(request: IPageRequest): Promise<IPage<ISerie>> {
    const offset = request.page * request.itemsPerPage;

    let items;
    let total;

    if (request.filterWatched === undefined) {
      if (request.q) {
        [items, total] = await Promise.all([
          this.repository.findAllWithNameLike(
            request.q,
            offset,
            request.itemsPerPage,
            request.order,
          ),
          this.repository.countWithNameLike(request.q),
        ]);
      } else {
        [items, total] = await Promise.all([
          this.repository.findAll(offset, request.itemsPerPage, request.order),
          this.repository.count(),
        ]);
      }
    } else {
      if (request.q) {
        [items, total] = await Promise.all([
          this.repository.findAllByWatchedWithNameLike(
            request.filterWatched,
            request.q,
            offset,
            request.itemsPerPage,
            request.order,
          ),
          this.repository.countByWatchedWithNameLike(
            request.filterWatched,
            request.q,
          ),
        ]);
      } else {
        [items, total] = await Promise.all([
          this.repository.findAllByWatched(
            request.filterWatched,
            offset,
            request.itemsPerPage,
            request.order,
          ),
          this.repository.countByWatched(request.filterWatched),
        ]);
      }
    }

    return {
      currentPage: request.page,
      items,
      itemsPerPage: request.itemsPerPage,
      numItems: total,
      totalPages: Math.ceil(total / request.itemsPerPage),
    };
  }

  public async updateEpisodeWatched(
    eventEmitterInstance: IEventEmitterInstance,
    serieId: string,
    seasonNumber: number,
    episodeNumber: number,
    watched: boolean,
  ): Promise<void> {
    await this.repository.updateEpisodeWatched(
      serieId,
      seasonNumber,
      episodeNumber,
      watched,
    );
    eventEmitterInstance.add(
      this.buildSerieEpisodeWatchedUpdated(
        serieId,
        seasonNumber,
        episodeNumber,
        watched,
      ),
    );
  }

  private _addOldWatched(
    oldSerie: ISerieWithSeasons,
    newSerie: ISerieWithSeasons,
  ): void {
    const keyGenerator = (
      season: ISerieSeason,
      episode: ISerieEpisode,
    ): string => `S${season.number}E${episode.number}`;

    const watchedMap: { [key: string]: boolean } = {};
    oldSerie.seasons.forEach((season) => {
      season.episodes.forEach((episode) => {
        watchedMap[keyGenerator(season, episode)] = episode.watched;
      });
    });

    newSerie.seasons.forEach((season) => {
      season.episodes.forEach((episode) => {
        episode.watched = watchedMap[keyGenerator(season, episode)] || false;
      });
    });
  }

  private buildSerieAdded(serie: ISerie): ISerieAdded {
    return {
      emittedOn: new Date(),
      event: "serie-added",
      serieId: serie.id || "",
    };
  }

  private buildSerieEpisodeWatchedUpdated(
    serieId: string,
    seasonNumber: number,
    episodeNumber: number,
    watched: boolean,
  ): ISerieEpisodeWatchedUpdated {
    return {
      emittedOn: new Date(),
      episodeNumber,
      event: "serie-episode-watched-updated",
      seasonNumber,
      serieId,
      watched,
    };
  }

  private buildSerieRefreshed(serie: ISerie): ISerieRefreshed {
    return {
      emittedOn: new Date(),
      event: "serie-refreshed",
      serieId: serie.id || "",
    };
  }

  private buildSerieRemoved(serieId: string): ISerieRemoved {
    return {
      emittedOn: new Date(),
      event: "serie-removed",
      serieId,
    };
  }
}
