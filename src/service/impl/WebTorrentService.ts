import * as express from "express";
import mime from "mime";
import pump from "pump";
import rangeParser, { Range, Ranges } from "range-parser";
import WebTorrent, { Instance, Torrent, TorrentFile } from "webtorrent";

import { ITorrentDownloadData } from "../../entity/ITorrendDonloadData";
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

  private callbacks: { [serverID: number]: ITorrentCallback[] } = {};

  constructor(dataFolder: string, hostURL: string, app: express.Application) {
    this.dataFolder = dataFolder;
    this.hostURL = hostURL;

    this.createHandler(app);
  }

  public createServer(magnetURI: string): Promise<number> {
    return new Promise((resolve, reject) => {
      // TODO on error mechanism
      this.webTorrent.add(
        magnetURI,
        { path: this.dataFolder },
        (torrent: Torrent) => {
          const serverID = this.data.length;
          this.data.push({
            files: this.getFiles(serverID, torrent),
            torrent,
          });

          this.webTorrent.addListener("download", () =>
            this.runCallbacks(serverID, TorrentAction.DOWNLOAD),
          );
          this.webTorrent.addListener("done", () =>
            this.runCallbacks(serverID, TorrentAction.DONE),
          );
          this.webTorrent.addListener("noPeers", () =>
            this.runCallbacks(serverID, TorrentAction.NO_PEERS),
          );

          resolve(serverID);
        },
      );
    });
  }

  public destroyServer(serverID: number): Promise<void> {
    const { torrent } = this.data.splice(serverID, 1)[0];

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

  public findAllVideos(serverID: number): Promise<IVideo[]> {
    const { files } = this.data[serverID];

    return Promise.resolve(files.map((f) => f.video));
  }

  public findVideoById(serverID: number, videoID: number): Promise<IVideo> {
    const { files } = this.data[serverID];

    return Promise.resolve(files[videoID].video);
  }

  public startDownload(serverID: number, videoID: number): void {
    return this.data[serverID].files[videoID].file.select();
  }

  public on(
    serverID: number,
    action: TorrentAction,
    callback: () => void,
  ): void {
    if (!this.callbacks[serverID]) {
      this.callbacks[serverID] = [];
    }

    this.callbacks[serverID].push({ action, callback });
  }

  public getDownloadData(serverID: number): ITorrentDownloadData {
    const { torrent } = this.data[serverID];

    return {
      downloadSpeed: torrent.downloadSpeed,
      downloaded: torrent.downloaded,
      downloadedPerentage: torrent.progress,
    };
  }

  private parseUrlFromFile(serverID: number, fileID: number) {
    return this.hostURL + this.parsePathFromFile(serverID, fileID);
  }

  private parsePathFromFile(serverID: number, fileID: number): string {
    return "/torrent/servers/" + serverID + "/files/" + fileID + "/stream";
  }

  private getFiles(serverID: number, torrent: Torrent): IWebTorrentFile[] {
    const videos = [];
    let fileIndex = 0;
    for (const file of torrent.files) {
      if (isVideoFilename(file.name)) {
        videos.push({
          file,
          video: {
            contentType: contentTypeFromFilename(file.name),
            filename: file.name,
            id: fileIndex,
            name: file.name,
            url: this.parseUrlFromFile(serverID, fileIndex),
          },
        });
        fileIndex++;
      }
    }

    return videos;
  }

  private runCallbacks(serverID: number, action: TorrentAction): void {
    if (this.callbacks[serverID]) {
      this.callbacks[serverID]
        .filter((c) => c.action === action)
        .forEach((c) => c.callback());
    }
  }

  private createHandler(app: express.Application) {
    app.all("/torrent/servers/:serverID/files/:fileID/stream", (req, res) => {
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
        const serverID = parseInt(req.params.serverID, 10);
        const fileID = parseInt(req.params.fileID, 10);

        const server = this.data[serverID];
        const fileWrapper = (server || { videos: [] }).files[fileID];

        if (server && fileWrapper) {
          const file = fileWrapper.file;
          const video = fileWrapper.video;

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
            pump(file.createReadStream(), res);
          } else {
            pump(file.createReadStream(range), res);
          }
        } else {
          res.sendStatus(404);
        }
      }
    });
  }
}

interface IWebTorrentFile {
  video: IVideo;

  file: TorrentFile;
}

interface IWebTorrentServer {
  torrent: Torrent;

  files: IWebTorrentFile[];
}
