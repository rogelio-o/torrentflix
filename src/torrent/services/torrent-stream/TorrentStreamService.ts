import * as express from "express";
import mime from "mime";
import pump from "pump";
import rangeParser, { Range, Ranges } from "range-parser";
import torrentStream from "torrent-stream";

import { IVideo } from "../../../common/entity/IVideo";
import { ITorrentDownloadData } from "../entity/ITorrendDonloadData";
import { ITorrentCallback } from "../entity/ITorrentCallback";
import { ITorrentService, TorrentAction } from "../ITorrentService";
import { ITorrentStreamFile } from "./entity/ITorrentStreamFile";
import { ITorrentStreamServer } from "./entity/ITorrentStreamServer";

const isVideoFilename = (filename: string): boolean => {
  return filename.endsWith(".mkv") || filename.endsWith(".mp4");
};

const contentTypeFromFilename = (filename: string): string => {
  /*if (filename.endsWith(".mkv")) {
    return "video/x-mkv";
  } else if (filename.endsWith(".mp4")) {
    return "video/mpeg";
  } else {
    throw new Error("Not supported extension.");
  }*/
  return mime.getType(filename) || "";
};

export class TorrentStreamService implements ITorrentService {
  private dataFolder: string;

  private hostURL: string;

  private app: express.Application;

  private data: ITorrentStreamServer[] = [];

  private callbacks: { [serverID: number]: ITorrentCallback[] } = {};

  constructor(dataFolder: string, hostURL: string, app: express.Application) {
    this.dataFolder = dataFolder;
    this.hostURL = hostURL;
    this.app = app;

    this.createHandler(app);
  }

  public createServer(magnetURI: string): Promise<number> {
    const engine = torrentStream(magnetURI, {
      tmp: this.dataFolder,
    });

    // FIXME reject on error
    return new Promise((resolve, reject) => {
      engine.on("ready", () => {
        const serverID = this.data.length;
        const files = this.getFiles(serverID, engine.files);

        this.data.push({
          engine,
          files,
        });

        engine.on("download", () =>
          this.runCallbacks(serverID, TorrentAction.DOWNLOAD),
        );

        engine.on("idle", () =>
          this.runCallbacks(serverID, TorrentAction.DONE),
        );

        resolve(serverID);
      });
    });
  }

  public destroyServer(serverID: number): Promise<void> {
    const { engine } = this.data.splice(serverID, 1)[0];

    return new Promise((resolve, reject) => {
      engine.destroy(() => resolve());
    });
  }

  public findAllVideos(serverID: number): Promise<IVideo[]> {
    return Promise.resolve(this.data[serverID].files.map((file) => file.video));
  }

  public findVideoById(serverID: number, videoID: number): Promise<IVideo> {
    return Promise.resolve(this.data[serverID].files[videoID].video);
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
    const engine = this.data[serverID].engine;

    const totalLength = engine.files.reduce((prevFileLength, currFile) => {
      return prevFileLength + currFile.length;
    }, 0);
    const swarm: any = engine.swarm;
    return {
      downloadSpeed: parseInt(swarm.downloadSpeed(), 10),
      downloaded: swarm.downloaded,
      downloadedPerentage: swarm.downloaded / totalLength,
    };
  }

  private parseUrlFromFile(serverID: number, fileID: number): string {
    return this.hostURL + this.parsePathFromFile(serverID, fileID);
  }

  private parsePathFromFile(serverID: number, fileID: number): string {
    return "/torrent/servers/" + serverID + "/files/" + fileID + "/stream";
  }

  private getFiles(
    serverID: number,
    files: TorrentStream.TorrentFile[],
  ): ITorrentStreamFile[] {
    const videos: ITorrentStreamFile[] = [];
    let fileIndex = 0;
    for (const file of files) {
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
        res.setHeader(
          "Access-Control-Allow-Origin",
          req.headers.origin as string,
        );
        res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        res.setHeader(
          "Access-Control-Allow-Headers",
          req.headers["access-control-request-headers"],
        );
        res.setHeader("Access-Control-Max-Age", "1728000");

        res.end();
      } else {
        if (req.headers.origin) {
          res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
        }

        const serverID = parseInt(req.params.serverID, 10);
        const fileID = parseInt(req.params.fileID, 10);

        const server = this.data[serverID];
        const fileWrapper = (server || { videos: [] }).files[fileID];

        if (server && fileWrapper) {
          const file = fileWrapper.file;
          const video = fileWrapper.video;

          const rangeHeader: string | undefined = req.headers.range;
          const ranges: Ranges | -1 | -2 | undefined = rangeHeader
            ? rangeParser(file.length, rangeHeader)
            : undefined;
          const range: Range | undefined =
            ranges === undefined || ranges === -1 || ranges === -2
              ? undefined
              : ranges[0];
          res.setHeader("Accept-Ranges", "bytes");
          res.setHeader("Content-Type", video.contentType);
          res.setHeader("transferMode.dlna.org", "Streaming");
          res.setHeader(
            "contentFeatures.dlna.org",
            "DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000",
          );

          if (range) {
            res.statusCode = 206;
            res.setHeader("Content-Length", range.end - range.start + 1);
            res.setHeader(
              "Content-Range",
              "bytes " + range.start + "-" + range.end + "/" + file.length,
            );
            if (req.method === "HEAD") {
              return res.end();
            }
            pump(file.createReadStream(range), res);
          } else {
            res.setHeader("Content-Length", file.length);
            if (req.method === "HEAD") {
              return res.end();
            }
            pump(file.createReadStream(), res);
          }
        } else {
          res.sendStatus(404);
        }
      }
    });

    app.options(
      "/torrent/servers/:serverID/files/:fileID/stream",
      (req, res) => {
        res.setHeader(
          "Access-Control-Allow-Origin",
          req.headers.origin as string,
        );
        res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        res.setHeader(
          "Access-Control-Allow-Headers",
          req.headers["access-control-request-headers"] as string,
        );
        res.setHeader("Access-Control-Max-Age", "1728000");

        res.end();
      },
    );
  }
}
