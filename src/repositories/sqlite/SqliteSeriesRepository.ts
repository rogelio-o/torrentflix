import { Database } from "sqlite";

import { IEntityOrder } from "../../entity/IEntityOrder";
import { ISerie } from "../../entity/ISerie";
import { ISerieEpisode } from "../../entity/ISerieEpisode";
import { ISerieSeason } from "../../entity/ISerieSeason";
import { ISerieWithSeasons } from "../../entity/ISerieWithSeasons";
import { groupBy } from "../../utils/arrayUtils";
import { parseSqlLimit, parseSqlOrder } from "../../utils/sqlUtils";
import { ISeriesRepository } from "../ISeriesRepository";

const SELECT_SERIE_ATTRS =
  "s.id as id, s.name as name, s.poster as poster, s.backdrop as backdrop, " +
  "s.description as description, s.external_reference_id as external_reference_id, s.genres as genres, " +
  "s.network as network, s.status as status, s.vote_average as vote_average, s.vote_count as vote_count";

export class SqliteSeriesRepository implements ISeriesRepository {
  private dbPromise: Promise<Database>;

  constructor(dbPromise: Promise<Database>) {
    this.dbPromise = dbPromise;
  }

  public async findById(serieId: string): Promise<ISerieWithSeasons> {
    const db = await this.dbPromise;

    const [seriesRows, episodesRows] = await Promise.all([
      db.all("SELECT * FROM series WHERE id = ?", serieId),
      db.all("SELECT * FROM series_episodes WHERE serie_id = ?", serieId),
    ]);

    return this.mapSerieWithSeasonsRow(seriesRows[0], episodesRows);
  }

  public async findAll(
    offset?: number,
    limit?: number,
    order?: IEntityOrder,
  ): Promise<ISerie[]> {
    const db = await this.dbPromise;

    const rows = await db.all(
      `SELECT * FROM series ${parseSqlOrder(order)} ${parseSqlLimit(
        offset,
        limit,
      )}`,
    );

    return rows.map((row) => this.mapSerieRow(row));
  }

  public async findAllWithNameLike(
    q: string,
    offset?: number,
    limit?: number,
    order?: IEntityOrder,
  ): Promise<ISerie[]> {
    const db = await this.dbPromise;

    const rows = await db.all(
      `SELECT * FROM series WHERE name LIKE $q ${parseSqlOrder(
        order,
      )} ${parseSqlLimit(offset, limit)}`,
      { $q: `%${q}%` },
    );

    return rows.map((row) => this.mapSerieRow(row));
  }

  public async findAllByWatched(
    watched: boolean,
    offset?: number,
    limit?: number,
    order?: IEntityOrder,
  ): Promise<ISerie[]> {
    const db = await this.dbPromise;

    const rows = await db.all(
      `SELECT ${SELECT_SERIE_ATTRS} FROM series AS s JOIN series_episodes AS e ON s.id = e.serie_id WHERE e.watched = $watched ` +
        `AND e.date < date('now') GROUP BY s.id ${parseSqlOrder(
          order,
        )} ${parseSqlLimit(offset, limit)}`,
      { $watched: watched },
    );

    return rows.map((row) => this.mapSerieRow(row));
  }

  public async findAllByWatchedWithNameLike(
    watched: boolean,
    q: string,
    offset?: number,
    limit?: number,
    order?: IEntityOrder,
  ): Promise<ISerie[]> {
    const db = await this.dbPromise;

    const rows = await db.all(
      `SELECT ${SELECT_SERIE_ATTRS} FROM series AS s JOIN series_episodes AS e ON s.id = e.serie_id WHERE s.name LIKE $q` +
        " AND e.watched = $watched AND e.date < date('now')" +
        ` GROUP BY s.id ${parseSqlOrder(order, "s.")} ${parseSqlLimit(
          offset,
          limit,
        )}`,
      { $q: `%${q}%`, $watched: watched },
    );

    return rows.map((row) => this.mapSerieRow(row));
  }

  public async count(): Promise<number> {
    const db = await this.dbPromise;

    const row = await db.get("SELECT count(*) as count FROM series");

    return row.count;
  }

  public async countWithNameLike(q: string): Promise<number> {
    const db = await this.dbPromise;

    const row = await db.get(
      "SELECT count(*) as count FROM series WHERE name LIKE $q",
      { $q: `%${q}%` },
    );

    return row.count;
  }

  public async countByWatched(watched: boolean): Promise<number> {
    const db = await this.dbPromise;

    const row = await db.get(
      "SELECT count(*) as count FROM (SELECT 1 FROM series AS s JOIN series_episodes AS e ON s.id = e.serie_id " +
        "WHERE e.watched = $watched AND e.date < date('now') GROUP BY s.id)",
      { $watched: watched },
    );

    return row.count;
  }

  public async countByWatchedWithNameLike(
    watched: boolean,
    q: string,
  ): Promise<number> {
    const db = await this.dbPromise;

    const row = await db.get(
      "SELECT count(*) as count FROM (SELECT 1 FROM series AS s JOIN series_episodes AS e ON s.id = e.serie_id " +
        "WHERE e.watched = $watched AND name LIKE $q AND e.date < date('now') GROUP BY s.id)",
      { $q: `%${q}%`, $watched: watched },
    );

    return row.count;
  }

  public async create(serie: ISerieWithSeasons): Promise<void> {
    const db = await this.dbPromise;

    const statement = await db.run(
      "INSERT INTO series (external_reference_id, name, poster, backdrop, status, network, genres, description, " +
        "vote_average, vote_count) VALUES ($externalReferenceId, $name, $poster, $backdrop, $status, $network, " +
        "$genres, $description, $voteAverage, $voteCount)",
      this.parseParams(serie),
    );
    serie.id = statement.lastID.toString();

    await this.createEpisodes(serie);
  }

  public async update(serie: ISerieWithSeasons): Promise<void> {
    const db = await this.dbPromise;

    await db.run(
      "UPDATE series SET external_reference_id = $externalReferenceId, name = $name, poster = $poster, " +
        "backdrop = $backdrop, status = $status, network = $network, genres = $genres, description = $description, " +
        "vote_average = $voteAverage, vote_count = $voteCount WHERE id = $id",
      this.parseParams(serie),
    );

    await this.updateEpisodes(serie);
  }

  public async delete(serieId: string): Promise<void> {
    const db = await this.dbPromise;

    await db.run("DELETE FROM series WHERE id = ?", serieId);
  }

  public async updateEpisodeWatched(
    serieId: string,
    seasonNumber: number,
    episodeNumber: number,
    watched: boolean,
  ): Promise<void> {
    const db = await this.dbPromise;

    await db.run(
      "UPDATE series_episodes SET watched = $watched WHERE serie_id = $serieId AND season = $season " +
        "AND number = $episode",
      {
        $episode: episodeNumber,
        $season: seasonNumber,
        $serieId: serieId,
        $watched: watched ? 1 : 0,
      },
    );
  }

  private parseParams(serie: ISerieWithSeasons): any {
    return {
      $backdrop: serie.backdrop,
      $description: serie.description,
      $externalReferenceId: serie.externalReferenceId,
      $genres: serie.genres.join(","),
      $id: serie.id,
      $name: serie.name,
      $network: serie.network,
      $poster: serie.poster,
      $status: serie.status,
      $voteAverage: serie.voteAverage,
      $voteCount: serie.voteCount,
    };
  }

  private async createEpisodes(serie: ISerieWithSeasons): Promise<void> {
    const db = await this.dbPromise;

    const promises = [];

    for (const season of serie.seasons) {
      for (const episode of season.episodes) {
        promises.push(
          db.run(
            "INSERT INTO series_episodes (serie_id, season, number, name, date, description, vote_average, " +
              "vote_count, poster, watched) VALUES ($serieId, $season, $number, $name, $date, $description, $voteAverage, " +
              "$voteCount, $poster, $watched)",
            this.parseEpisodeParams(serie, season, episode),
          ),
        );
      }
    }

    await Promise.all(promises);
  }

  private async updateEpisodes(serie: ISerieWithSeasons): Promise<void> {
    await this.deleteEpisodes(serie);

    await this.createEpisodes(serie);
  }

  private async deleteEpisodes(serie: ISerieWithSeasons): Promise<void> {
    const db = await this.dbPromise;

    await db.run("DELETE FROM series_episodes WHERE serie_id = ?", serie.id);
  }

  private parseEpisodeParams(
    serie: ISerieWithSeasons,
    season: ISerieSeason,
    episode: ISerieEpisode,
  ): any {
    return {
      $date: episode.date ? episode.date.toISOString() : null,
      $description: episode.description,
      $name: episode.name,
      $number: episode.number,
      $poster: episode.poster,
      $season: season.number,
      $serieId: serie.id,
      $voteAverage: episode.voteAverage,
      $voteCount: episode.voteCount,
      $watched: episode.watched ? 1 : 0,
    };
  }

  private mapSerieRow(row: any): ISerie {
    return {
      backdrop: row.backdrop,
      description: row.description,
      externalReferenceId: row.external_reference_id,
      genres: row.genres.split(","),
      id: row.id.toString(),
      name: row.name,
      network: row.network,
      poster: row.poster,
      status: row.status,
      voteAverage: row.vote_average,
      voteCount: row.vote_count,
    };
  }

  private mapSerieWithSeasonsRow(
    row: any,
    episodesRows: any[],
  ): ISerieWithSeasons {
    return {
      backdrop: row.backdrop,
      description: row.description,
      externalReferenceId: row.external_reference_id,
      genres: row.genres.split(","),
      id: row.id.toString(),
      name: row.name,
      network: row.network,
      poster: row.poster,
      seasons: this.mapEpisodeRows(episodesRows),
      status: row.status,
      voteAverage: row.vote_average,
      voteCount: row.vote_count,
    };
  }

  private mapEpisodeRows(episodesRows: any[]): ISerieSeason[] {
    const seasons: { [key: string]: any[] } = groupBy(episodesRows, "season");

    return Object.keys(seasons).map((seasonNumber) => ({
      episodes: seasons[seasonNumber].map((row) => this.mapEpisodeRow(row)),
      number: parseInt(seasonNumber, 10),
    }));
  }

  private mapEpisodeRow(row: any): ISerieEpisode {
    return {
      date: new Date(row.date),
      description: row.description,
      name: row.name,
      number: row.number,
      poster: row.poster,
      voteAverage: row.vote_average,
      voteCount: row.vote_count,
      watched: row.watched === 1,
    };
  }
}
