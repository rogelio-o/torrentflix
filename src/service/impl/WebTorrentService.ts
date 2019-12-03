import * as express from "express";
import mime from "mime";
import pump from "pump";
import rangeParser, { Range, Ranges } from "range-parser";
import WebTorrent, { Instance, Torrent, TorrentFile } from "webtorrent";

import { ITorrent } from "../../entity/ITorren";
import { ITorrentCallback } from "../../entity/ITorrentCallback";
import { IVideo } from "../../entity/IVideo";
import { ITorrentService, TorrentAction } from "../ITorrentService";

const isVideoFilename = (filename: string): boolean => {
  return filename.endsWith(".mkv") || filename.endsWith(".mp4");
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
  private data: IWebTorrentServer[] = [];

  private webTorrent: Instance = new WebTorrent();

  private dataFolder: string;

  private hostURL: string;

  private callbacks: { [torrentID: number]: ITorrentCallback[] } = {};

  constructor(dataFolder: string, hostURL: string, app: express.Application) {
    this.dataFolder = dataFolder;
    this.hostURL = hostURL;

    this.createHandler(app);
  }

  public load(magnetURI: string): Promise<number> {
    return new Promise((resolve, reject) => {
      // TODO on error mechanism
      this.webTorrent.add(
        magnetURI,
        { path: this.dataFolder },
        (torrent: Torrent) => {
          const torrentID = this.data.length;
          this.data.push({
            files: this.getFiles(torrentID, torrent),
            torrent,
          });

          this.webTorrent.addListener("download", () =>
            this.runCallbacks(torrentID, TorrentAction.DOWNLOAD),
          );
          this.webTorrent.addListener("done", () =>
            this.runCallbacks(torrentID, TorrentAction.DONE),
          );
          this.webTorrent.addListener("noPeers", () =>
            this.runCallbacks(torrentID, TorrentAction.NO_PEERS),
          );

          resolve(torrentID);
        },
      );
    });
  }

  public remove(torrentID: number): Promise<void> {
    const { torrent } = this.data.splice(torrentID, 1)[0];

    return new Promise((resolve, reject) => {
      this.webTorrent.remove(torrent, (err?) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public findAllVideos(torrentID: number): Promise<IVideo[]> {
    const { files } = this.data[torrentID];

    return Promise.resolve(
      files.map((f, index) => this.parseVideo(torrentID, index, f)),
    );
  }

  public findVideoById(torrentID: number, videoID: number): Promise<IVideo> {
    const { files } = this.data[torrentID];

    return Promise.resolve(this.parseVideo(torrentID, videoID, files[videoID]));
  }

  public startDownload(torrentID: number, videoID: number): void {
    return this.data[torrentID].files[videoID].select();
  }

  public on(
    torrentID: number,
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
      this.data.map(({ torrent }) => this.parseTorrent(torrent)),
    );
  }

  public findById(torrentID: number): Promise<ITorrent> {
    const { torrent } = this.data[torrentID];

    return Promise.resolve(this.parseTorrent(torrent));
  }

  private parseTorrent(torrent: Torrent): ITorrent {
    return {
      downloadSpeed: torrent.downloadSpeed,
      downloaded: torrent.downloaded,
      downloadedPerentage: torrent.progress,
      magnetUri: torrent.magnetURI,
      name: torrent.name,
      uploadSpeed: torrent.uploadSpeed,
    };
  }

  private parseVideo(torrentID: number, videoID: number, file: TorrentFile) {
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

  private parseUrlFromFile(torrentID: number, fileID: number) {
    return this.hostURL + this.parsePathFromFile(torrentID, fileID);
  }

  private parsePathFromFile(torrentID: number, fileID: number): string {
    return "/torrent/servers/" + torrentID + "/files/" + fileID + "/stream";
  }

  private getFiles(torrentID: number, torrent: Torrent): TorrentFile[] {
    const videos = [];
    let fileIndex = 0;
    for (const file of torrent.files) {
      if (isVideoFilename(file.name)) {
        videos.push(file);
        fileIndex++;
      }
    }

    return videos;
  }

  private runCallbacks(torrentID: number, action: TorrentAction): void {
    if (this.callbacks[torrentID]) {
      this.callbacks[torrentID]
        .filter((c) => c.action === action)
        .forEach((c) => c.callback());
    }
  }

  private createHandler(app: express.Application) {
    app.all("/torrent/servers/:torrentID/files/:fileID/stream", (req, res) => {
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
        const torrentID = parseInt(req.params.torrentID, 10);
        const fileID = parseInt(req.params.fileID, 10);

        const server = this.data[torrentID];
        const file = (server || { videos: [] }).files[fileID];

        if (server && file) {
          let stream: any | undefined;
          res.on("close", () => stream && stream.destroy());
          res.on("end", () => stream && stream.destroy());

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

          pump(stream, res);
        } else {
          res.sendStatus(404);
        }
      }
    });
  }
}

interface IWebTorrentServer {
  torrent: Torrent;

  files: TorrentFile[];
}
