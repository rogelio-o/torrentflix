import { Database } from "sqlite";

import { IEntityOrder } from "../../entity/IEntityOrder";
import { IMovie } from "../../entity/IMovie";
import { parseSqlOrder } from "../../utils/sqlUtils";
import { IMoviesRepository } from "../IMoviesRepository";

export class SqliteMoviesRepository implements IMoviesRepository {
  private dbPromise: Promise<Database>;

  constructor(dbPromise: Promise<Database>) {
    this.dbPromise = dbPromise;
  }

  public async create(movie: IMovie): Promise<void> {
    const db = await this.dbPromise;

    const statement = await db.run(
      "INSERT INTO movies (external_reference_id, title, genres, popularity, vote_average, vote_count, " +
        "original_language, description, poster, backdrop, release_date, duration) VALUES ($externalReferenceId, " +
        "$title, $genres, $popularity, $voteAverage, $voteCount, $originalLanguage, $description, $poster, " +
        "$backdrop, $releaseDate, $duration)",
      this.parseParams(movie),
    );
    movie.id = statement.lastID.toString();
  }

  public async update(movie: IMovie): Promise<void> {
    const db = await this.dbPromise;

    await db.run(
      "UPDATE movies SET external_reference_id = $externalReferenceId, title = $title, genres = $genres, " +
        "popularity = $popularity, vote_average = $voteAverage, vote_count = $voteCount, " +
        "original_language = $originalLanguage, description = $description, poster = $poster, backdrop = $backdrop, " +
        "release_date = $releaseDate, duration = $duration WHERE id = $id",
      this.parseParams(movie),
    );
  }

  public async delete(movieId: string): Promise<void> {
    const db = await this.dbPromise;

    await db.run("DELETE FROM movies WHERE id = ?", movieId);
  }

  public async findAll(
    offset: number,
    limit: number,
    order?: IEntityOrder,
  ): Promise<IMovie[]> {
    const db = await this.dbPromise;

    const rows = await db.all(
      `SELECT * FROM movies ${parseSqlOrder(order)} LIMIT ${offset},${limit}`,
    );

    return rows.map((row) => this.parseRow(row));
  }

  public async count(): Promise<number> {
    const db = await this.dbPromise;

    const row = await db.get("SELECT COUNT(*) as count FROM movies");

    return row.count;
  }

  public async findById(movieId: string): Promise<IMovie> {
    const db = await this.dbPromise;

    const rows = await db.all("SELECT * FROM movies WHERE id = ?", movieId);

    return this.parseRow(rows[0]);
  }

  private parseRow(row: any): IMovie {
    return {
      backdrop: row.backdrop,
      description: row.description,
      duration: row.duration,
      externalReferenceId: row.external_reference_id,
      genres: row.genres.split(","),
      id: row.id,
      originalLanguage: row.original_language,
      popularity: row.popularity,
      poster: row.poster,
      releaseDate: new Date(row.release_date),
      title: row.title,
      voteAverage: row.vote_average,
      voteCount: row.vote_count,
    };
  }

  private parseParams(movie: IMovie): any {
    return {
      $backdrop: movie.backdrop,
      $description: movie.description,
      $duration: movie.duration,
      $externalReferenceId: movie.externalReferenceId,
      $genres: movie.genres.join(","),
      $id: movie.id,
      $originalLanguage: movie.originalLanguage,
      $popularity: movie.popularity,
      $poster: movie.poster,
      $releaseDate: movie.releaseDate.toUTCString(),
      $title: movie.title,
      $voteAverage: movie.voteAverage,
      $voteCount: movie.voteCount,
    };
  }
}
