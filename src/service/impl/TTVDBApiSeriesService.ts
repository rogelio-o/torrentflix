import axios from "axios";

import { IApiSerieSearchResult } from "../../entity/IApiSerieSearchResult";
import { ISerieEpisode } from "../../entity/ISerieEpisode";
import { ISerieSeason } from "../../entity/ISerieSeason";
import { ISerieWithSeasons } from "../../entity/ISerieWithSeasons";
import { groupBy } from "../../utils/arrayUtils";
import { IApiSeriesService } from "../IApiSeriesService";

const BASE_URL = "https://api.thetvdb.com";
const DEFAULT_LANG = "en-UK";
const API_VERSION = 3;

const parseJwt = (jwt: string): { [key: string]: any } => {
  const parts = jwt.split(".");

  return JSON.parse(new Buffer(parts[1], "base64").toString("ascii"));
};

const parseHeaders = (jwtToken?: string): { [key: string]: string } => {
  const result: { [key: string]: string } = {
    "Accept": `application/vnd.thetvdb.v${API_VERSION}`,
    "Accept-Language": DEFAULT_LANG,
  };

  if (jwtToken) {
    result.Authorization = `Bearer ${jwtToken}`;
  }

  return result;
};

export class TTVDBApiSeriesService implements IApiSeriesService {
  private apiKey: string;

  private jwtToken?: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public search(q: string): Promise<IApiSerieSearchResult[]> {
    return this.makeRequest(`${BASE_URL}/search/series`, {
      name: q,
    }).then((body) =>
      body.data.map((serie: any) => this.mapSerchResult(serie)),
    );
  }

  public async findById(
    externalReferenceId: string,
  ): Promise<ISerieWithSeasons> {
    const seriePromise = this.makeRequest(
      `${BASE_URL}/series/${externalReferenceId}`,
      {},
    );
    const episodesPromise = this.getAllEpisodes(externalReferenceId);

    const [serie, episodes] = await Promise.all([
      seriePromise,
      episodesPromise,
    ]);

    return this.mapSerie(serie.data, episodes);
  }

  private async getAllEpisodes(externalReferenceId: string): Promise<any[]> {
    const result = [];
    let page: number | null = 1;

    while (page !== null) {
      const body: any = await this.makeRequest(
        `${BASE_URL}/series/${externalReferenceId}/episodes`,
        {
          page: page.toString(),
        },
      );
      for (const episode of body.data) {
        result.push(episode);
      }
      page = body.links.next ? body.links.next : null;
    }

    return result;
  }

  private async makeRequest(
    path: string,
    query: { [key: string]: string },
  ): Promise<{ [key: string]: any }> {
    const token = await this.getJwtToken();

    const response = await axios.get(path, {
      headers: parseHeaders(token),
      params: query,
    });

    return response.data;
  }

  private async getJwtToken(): Promise<string> {
    if (this.jwtToken) {
      const jtwObj = parseJwt(this.jwtToken);

      if (!this.hasExpired(jtwObj)) {
        return Promise.resolve(this.jwtToken);
      }
    }

    const response = await axios.post(
      `${BASE_URL}/login`,
      {
        apikey: this.apiKey,
      },
      {
        headers: parseHeaders(),
      },
    );

    this.jwtToken = response.data.token;
    return this.jwtToken || "";
  }

  private hasExpired(jwtToken: { [key: string]: any }): boolean {
    const exp: number = jwtToken.exp;
    const now: number = Math.floor(Date.now() / 1000);

    return exp - 1000 <= now;
  }

  private mapSerchResult(serie: any): IApiSerieSearchResult {
    return {
      backdrop: serie.banner,
      description: serie.overview,
      externalReferenceId: serie.id.toString(),
      name: serie.seriesName,
      network: serie.network,
      status: serie.status,
    };
  }

  private mapSerie(serie: any, episodes: any): ISerieWithSeasons {
    return {
      backdrop: serie.banner,
      description: serie.overview,
      externalReferenceId: serie.id.toString(),
      genres: serie.genre,
      name: serie.seriesName,
      network: serie.network,
      poster: serie.poster,
      seasons: this.mapSeasons(episodes),
      status: serie.status,
      voteAverage: serie.siteRating,
      voteCount: serie.siteRatingCount,
    };
  }

  private mapSeasons(episodes: any): ISerieSeason[] {
    const seasons: { [key: string]: any } = groupBy(episodes, "airedSeason");

    return Object.keys(seasons).map((key) => ({
      episodes: this.mapEpisodes(seasons[key]),
      number: parseInt(key, 10),
    }));
  }

  private mapEpisodes(episodes: any): ISerieEpisode[] {
    return episodes.map((episode: any) => this.mapEpisode(episode));
  }

  private mapEpisode(episode: any): ISerieEpisode {
    return {
      date: new Date(episode.firstAired),
      description: episode.overview,
      name: episode.episodeName,
      number: episode.airedEpisodeNumber,
      poster: episode.filename,
      voteAverage: episode.siteRating,
      voteCount: episode.siteRatingCount,
    };
  }
}
