import TorrentSearchApi, { Torrent } from "torrent-search-api";

import { ITorrentSearchResult } from "../../entity/ITorrentSearchResult";
import { ITorrentSearchService, TorrentSearchCategory } from "../ITorrentSearchService";

const providers = process.env.TORRENT_PROVIDERS
  ? process.env.TORRENT_PROVIDERS.split(",")
  : ["ThePirateBay", "Rarbg", "1337x"];

providers.forEach((provider) => TorrentSearchApi.enableProvider(provider));

export class ApiTorrentSearchService implements ITorrentSearchService {
  public async search(
    q: string,
    category: TorrentSearchCategory,
    numResults: number,
  ): Promise<ITorrentSearchResult[]> {
    const torrents = await TorrentSearchApi.search(
      providers,
      q,
      this.mapCategory(category),
      numResults,
    );

    return await Promise.all(
      torrents.map((torrent) => this.mapResult(torrent)),
    );
  }

  private async mapResult(torrent: Torrent): Promise<ITorrentSearchResult> {
    const magnet = await TorrentSearchApi.getMagnet(torrent);

    return {
      descriptionUrl: torrent.desc,
      magnetUri: magnet,
      name: torrent.title,
      provider: torrent.provider,
      size: torrent.size,
      time: torrent.time,
    };
  }

  private mapCategory(category: TorrentSearchCategory): string {
    switch (category) {
      case TorrentSearchCategory.MOVIE:
        return "Movies";
      case TorrentSearchCategory.TV:
        return "TV";
      case TorrentSearchCategory.ALL:
      default:
        return "All";
    }
  }
}
