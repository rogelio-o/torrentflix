import * as express from "express";
import * as mime from "mime";
import rangeParser, { Range, Ranges } from "range-parser";
import rimraf from "rimraf";
import { pipeline } from "stream";
import uuidv4 from "uuid/v4";
import WebTorrent, { Instance, Torrent, TorrentFile } from "webtorrent";

import { logger } from "../../config/logger";
import { ITorrentAdded } from "../../entity/events/ITorrentAdded";
import { ITorrentDownloadDataUpdated } from "../../entity/events/ITorrentDownloadDataUpdated";
import { ITorrentDownloaded } from "../../entity/events/ITorrentDownloaded";
import { ITorrentGetNoPeers } from "../../entity/events/ITorrentGetNoPeers";
import { ITorrentRemoved } from "../../entity/events/ITorrentRemoved";
import { ITorrent } from "../../entity/ITorren";
import { ITorrentCallback } from "../../entity/ITorrentCallback";
import { ITorrentRow } from "../../entity/ITorrentRow";
import { IVideo } from "../../entity/IVideo";
import { ITorrentRepository } from "../../repositories/ITorrentRepository";
import { IEventEmitterInstance } from "../events/IEventEmitter";
import { ITorrentService, TorrentAction } from "../ITorrentService";

const isVideoFilename = (filename: string): boolean => {
  return (
    filename.endsWith(".mkv") ||
    filename.endsWith(".mp4") ||
    filename.endsWith(".avi")
  );
};

const contentTypeFromFilename = (filename: string) => {
  if (filename.endsWith(".mkv")) {
    return "video/x-mkv";
  } else {
    return mime.getType(filename) || "";
  }
};

const encodeRFC5987 = (str: string): string => {
  return (
    encodeURIComponent(str)
      // Note that although RFC3986 reserves "!", RFC5987 does not,
      // so we do not need to escape it
      .replace(/['()]/g, escape) // i.e., %27 %28 %29
      .replace(/\*/g, "%2A")
      // The following are not required for percent-encoding per RFC5987,
      // so we can allow for a little better readability over the wire: |`^
      .replace(/%(?:7C|60|5E)/g, unescape)
  );
};

export class WebTorrentService implements ITorrentService {
  private data: { [id: string]: IWebTorrentServer } = {};

  private webTorrent: Instance = new WebTorrent();

  private dataFolder: string;

  private hostURL: string;

  private torrentsRepository: ITorrentRepository;

  private callbacks: { [torrentID: string]: ITorrentCallback[] } = {};

  constructor(
    torrentsRepository: ITorrentRepository,
    dataFolder: string,
    hostURL: string,
    app: express.Application,
  ) {
    this.torrentsRepository = torrentsRepository;
    this.dataFolder = dataFolder;
    this.hostURL = hostURL;

    this.createHandler(app);
  }

  public createFromMagnet(
    eventEmitterInstance: IEventEmitterInstance,
    magnetUri: string,
  ): Promise<ITorrent> {
    return this.createFromRow(eventEmitterInstance, { magnetUri });
  }

  public async createFromRow(
    eventEmitterInstance: IEventEmitterInstance,
    torrentRow: ITorrentRow,
  ): Promise<ITorrent> {
    const torrent = await this.createWebTorrentFromMagnet(torrentRow.magnetUri);

    if (!torrentRow.id) {
      await this.torrentsRepository.save(torrentRow);
    }

    const torrentID = torrentRow.id || uuidv4();
    this.data[torrentID] = {
      files: this.getFiles(torrentID, torrent),
      torrent,
    };

    this.webTorrent.addListener("download", () => {
      eventEmitterInstance.addAndEmit(
        this.buildTorrentDownloadDataUpdated(
          this.parseTorrent(torrentID, torrent),
        ),
      );
      this.runCallbacks(torrentID, TorrentAction.DOWNLOAD);
    });
    this.webTorrent.addListener("done", () => {
      eventEmitterInstance.addAndEmit(
        this.buildTorrentDownloaded(this.parseTorrent(torrentID, torrent)),
      );
      this.runCallbacks(torrentID, TorrentAction.DONE);
    });
    this.webTorrent.addListener("noPeers", () => {
      eventEmitterInstance.addAndEmit(
        this.buildTorrentGetNoPeers(this.parseTorrent(torrentID, torrent)),
      );
      this.runCallbacks(torrentID, TorrentAction.NO_PEERS);
    });

    const parsedTorrent: ITorrent = this.parseTorrent(torrentID, torrent);
    eventEmitterInstance.add(this.buildTorrentAdded(parsedTorrent));
    return parsedTorrent;
  }

  public async remove(
    eventEmitterInstance: IEventEmitterInstance,
    torrentID: string,
  ): Promise<void> {
    await this.torrentsRepository.delete(torrentID);

    const { torrent } = this.data[torrentID];
    delete this.data[torrentID];
    eventEmitterInstance.add(
      this.buildTorrentRemoved(this.parseTorrent(torrentID, torrent)),
    );

    return new Promise((resolve, reject) => {
      this.webTorrent.remove(torrent, (err?) => {
        if (err) {
          reject(err);
        } else {
          rimraf(this.dataFolder + "/" + torrent.name, (err2?) => {
            if (err2) {
              reject(err2);
            } else {
              resolve();
            }
          });
        }
      });
    });
  }

  public findAllVideos(torrentID: string): Promise<IVideo[]> {
    const { files } = this.data[torrentID];

    return Promise.resolve(
      Object.keys(files).map((videoID) =>
        this.parseVideo(torrentID, videoID, files[videoID]),
      ),
    );
  }

  public findVideoById(torrentID: string, videoID: string): Promise<IVideo> {
    const { files } = this.data[torrentID];

    return Promise.resolve(this.parseVideo(torrentID, videoID, files[videoID]));
  }

  public startDownload(torrentID: string, videoID: string): void {
    return this.data[torrentID].files[videoID].select();
  }

  public on(
    torrentID: string,
    action: TorrentAction,
    callback: () => void,
  ): void {
    if (!this.callbacks[torrentID]) {
      this.callbacks[torrentID] = [];
    }

    this.callbacks[torrentID].push({ action, callback });
  }

  public findAll(): Promise<ITorrent[]> {
    return Promise.resolve(
      Object.keys(this.data).map((torrentID) =>
        this.parseTorrent(torrentID, this.data[torrentID].torrent),
      ),
    );
  }

  public findById(torrentID: string): Promise<ITorrent> {
    const { torrent } = this.data[torrentID];

    return Promise.resolve(this.parseTorrent(torrentID, torrent));
  }

  private createWebTorrentFromMagnet(magnetURI: string): Promise<Torrent> {
    return new Promise((resolve, reject) => {
      // TODO on error mechanism
      this.webTorrent.add(
        magnetURI,
        { path: this.dataFolder },
        (torrent: Torrent) => {
          resolve(torrent);
        },
      );
    });
  }

  private parseTorrent(torrentID: string, torrent: Torrent): ITorrent {
    return {
      downloadSpeed: torrent.downloadSpeed,
      downloaded: torrent.downloaded,
      downloadedPerentage: torrent.progress,
      id: torrentID,
      magnetUri: torrent.magnetURI,
      name: torrent.name,
      numPeers: torrent.numPeers,
      size: torrent.files.map((f) => f.length).reduce((a, b) => a + b),
      uploadSpeed: torrent.uploadSpeed,
    };
  }

  private parseVideo(torrentID: string, videoID: string, file: TorrentFile) {
    return {
      contentType: contentTypeFromFilename(file.name),
      downloaded: (file as any).downloaded,
      downloadedPerentage: (file as any).progress,
      filename: file.name,
      id: videoID,
      length: (file as any).length,
      name: file.name,
      torrentID,
      url: this.parseUrlFromFile(torrentID, videoID),
    };
  }

  private parseUrlFromFile(torrentID: string, fileID: string) {
    return this.hostURL + this.parsePathFromFile(torrentID, fileID);
  }

  private parsePathFromFile(torrentID: string, fileID: string): string {
    return "/api/torrent/servers/" + torrentID + "/files/" + fileID + "/stream";
  }

  private getFiles(
    torrentID: string,
    torrent: Torrent,
  ): { [id: string]: TorrentFile } {
    const result: { [id: string]: TorrentFile } = {};

    torrent.files
      .filter((f) => isVideoFilename(f.name))
      .forEach((f) => (result[uuidv4()] = f));

    return result;
  }

  private runCallbacks(torrentID: string, action: TorrentAction): void {
    if (this.callbacks[torrentID]) {
      this.callbacks[torrentID]
        .filter((c) => c.action === action)
        .forEach((c) => c.callback());
    }
  }

  private createHandler(app: express.Application) {
    app.all(
      "/api/torrent/servers/:torrentID/files/:fileID/stream",
      (req, res) => {
        if (
          req.method === "OPTIONS" &&
          req.headers["access-control-request-headers"]
        ) {
          res.statusCode = 204; // no content
          res.setHeader("Access-Control-Max-Age", "600");
          res.setHeader("Access-Control-Allow-Methods", "GET,HEAD");

          if (req.headers["access-control-request-headers"]) {
            res.setHeader(
              "Access-Control-Allow-Headers",
              req.headers["access-control-request-headers"],
            );
          }
          res.end();
        } else {
          const torrentID = req.params.torrentID;
          const fileID = req.params.fileID;

          const torrent = this.data[torrentID];
          const file = (torrent || { files: [] }).files[fileID];

          if (file) {
            let stream: any | undefined;

            res.statusCode = 200;
            res.setHeader(
              "Content-Type",
              mime.getType(file.name) || "application/octet-stream",
            );

            // Support range-requests
            res.setHeader("Accept-Ranges", "bytes");

            // Set name of file (for "Save Page As..." dialog)
            res.setHeader(
              "Content-Disposition",
              `inline; filename*=UTF-8''${encodeRFC5987(file.name)}`,
            );

            // Support DLNA streaming
            res.setHeader("transferMode.dlna.org", "Streaming");
            res.setHeader(
              "contentFeatures.dlna.org",
              "DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000",
            );

            // `rangeParser` returns an array of ranges, or an error code (number) if
            // there was an error parsing the range.
            let range: Ranges | -1 | -2 | Range | null = rangeParser(
              file.length,
              req.headers.range || "",
            );

            if (Array.isArray(range)) {
              res.statusCode = 206; // indicates that range-request was understood

              // no support for multi-range request, just use the first range
              range = range[0];

              res.setHeader(
                "Content-Range",
                `bytes ${range.start}-${range.end}/${file.length}`,
              );
              res.setHeader("Content-Length", range.end - range.start + 1);
            } else {
              range = null;
              res.setHeader("Content-Length", file.length);
            }

            if (req.method === "HEAD") {
              return res.end();
            }

            if (range === null) {
              stream = file.createReadStream();
            } else {
              stream = file.createReadStream(range);
            }

            pipeline(stream, res, (err) => {
              if (err && err.code !== "ERR_STREAM_PREMATURE_CLOSE") {
                logger.error("Pipeline failed.", err);
              }
            });
          } else {
            res.sendStatus(404);
          }
        }
      },
    );
  }

  private buildTorrentAdded(torrent: ITorrent): ITorrentAdded {
    return {
      emittedOn: new Date(),
      event: "torrent-added",
      torrentId: torrent.id,
    };
  }

  private buildTorrentDownloadDataUpdated(
    torrent: ITorrent,
  ): ITorrentDownloadDataUpdated {
    return {
      downloadSpeed: torrent.downloadSpeed,
      downloaded: torrent.downloaded,
      downloadedPerentage: torrent.downloadedPerentage,
      emittedOn: new Date(),
      event: "torrent-download-data-updated",
      torrentId: torrent.id,
    };
  }

  private buildTorrentDownloaded(torrent: ITorrent): ITorrentDownloaded {
    return {
      emittedOn: new Date(),
      event: "torrent-downloaded",
      torrentId: torrent.id,
    };
  }

  private buildTorrentGetNoPeers(torrent: ITorrent): ITorrentGetNoPeers {
    return {
      emittedOn: new Date(),
      event: "torrent-get-no-peers",
      torrentId: torrent.id,
    };
  }

  private buildTorrentRemoved(torrent: ITorrent): ITorrentRemoved {
    return {
      emittedOn: new Date(),
      event: "torrent-removed",
      torrentId: torrent.id,
    };
  }
}

interface IWebTorrentServer {
  torrent: Torrent;

  files: { [id: string]: TorrentFile };
}
