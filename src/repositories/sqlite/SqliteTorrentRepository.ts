import { Database } from "sqlite";

import { ITorrentRow } from "../../entity/ITorrentRow";
import { ITorrentRepository } from "../ITorrentRepository";

export class SqliteTorrentRepository implements ITorrentRepository {
  private dbPromise: Promise<Database>;

  constructor(dbPromise: Promise<Database>) {
    this.dbPromise = dbPromise;
  }

  public async save(row: ITorrentRow): Promise<void> {
    const db = await this.dbPromise;

    const statement = await db.run(
      "INSERT INTO torrents (magnet_uri) VALUES (?)",
      row.magnetUri,
    );
    row.id = statement.lastID.toString();
  }

  public async findAll(): Promise<ITorrentRow[]> {
    const db = await this.dbPromise;
    const rows = await db.all("SELECT * FROM torrents");

    return rows.map((row) => this.parseRow(row));
  }

  public async delete(torrentID: string): Promise<void> {
    const db = await this.dbPromise;

    return db
      .run("DELETE FROM torrents WHERE id = ?", parseInt(torrentID, 10))
      .then();
  }

  private parseRow(row: any): ITorrentRow {
    return { id: row.id, magnetUri: row.magnet_uri };
  }
}
