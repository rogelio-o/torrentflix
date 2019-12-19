import { IApiSerieSearchResult } from "../../entity/IApiSerieSearchResult";
import { IPage } from "../../entity/IPage";
import { IPageRequest } from "../../entity/IPageRequest";
import { ISerie } from "../../entity/ISerie";
import { ISerieWithSeasons } from "../../entity/ISerieWithSeasons";
import { ISeriesRepository } from "../../repositories/ISeriesRepository";
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

  public async create(externalReferenceId: string): Promise<ISerieWithSeasons> {
    const serie = await this.apiService.findById(externalReferenceId);
    await this.repository.create(serie);

    return serie;
  }

  public async refresh(serieId: string): Promise<ISerieWithSeasons> {
    const oldSerie = await this.repository.findById(serieId);
    const newSerie = await this.apiService.findById(
      oldSerie.externalReferenceId,
    );
    newSerie.id = oldSerie.id;
    await this.repository.update(newSerie);

    return newSerie;
  }

  public delete(serieId: string): Promise<void> {
    return this.repository.delete(serieId);
  }

  public findById(serieId: string): Promise<ISerieWithSeasons> {
    return this.repository.findById(serieId);
  }

  public async findPage(request: IPageRequest): Promise<IPage<ISerie>> {
    const offset = request.page * request.itemsPerPage;

    const [items, total] = await Promise.all([
      this.repository.findAll(offset, request.itemsPerPage, request.order),
      this.repository.count(),
    ]);

    return {
      currentPage: request.page,
      items,
      itemsPerPage: request.itemsPerPage,
      numItems: total,
      totalPages: Math.ceil(total / request.itemsPerPage),
    };
  }
}
