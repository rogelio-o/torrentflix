import WebTorrent, { Instance, Torrent, TorrentFile } from "webtorrent";

import { IVideo } from "../../../common/entity/IVideo";
import { ITorrentDownloadData } from "../entity/ITorrendDonloadData";
import { ITorrentCallback } from "../entity/ITorrentCallback";
import { ITorrentService, TorrentAction } from "../ITorrentService";
import { IWebTorrentServer } from "./entity/IWebTorrentServer";

const isVideoFilename = (filename: string): boolean => {
  return filename.endsWith(".mkv") || filename.endsWith(".mp4");
};

const contentTypeFromFilename = (filename: string) => {
  if (filename.endsWith(".mkv")) {
    return "video/x-mkv";
  } else if (filename.endsWith(".mp4")) {
    return "video/mpeg";
  } else {
    throw new Error("Not supported extension.");
  }
};

export class WebTorrentService implements ITorrentService {
  private data: IWebTorrentServer[] = [];

  private webTorrent: Instance = new WebTorrent();

  private hostURL: string;

  private callbacks: { [serverID: number]: ITorrentCallback[] } = {};

  private portRangeStart: number;

  constructor(hostURL: string, portRangeStart: number) {
    this.hostURL = hostURL;
    this.portRangeStart = portRangeStart;
  }

  public createServer(magnetURI: string): Promise<number> {
    return new Promise((resolve, reject) => {
      // TODO on error mechanism
      this.webTorrent.add(magnetURI, (torrent: Torrent) => {
        const port = this.portRangeStart + this.data.length;
        const server = torrent.createServer();
        server.listen(port);
        const serverID =
          this.data.push({
            server,
            torrent,
            videos: this.getVideos(torrent, port),
          }) - 1;

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
      });
    });
  }

  public destroyServer(serverID: number): Promise<void> {
    const { server, torrent } = this.data.splice(serverID, 1)[0];

    const p1 = new Promise((resolve, reject) => {
      server.close((err?) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    const p2 = new Promise((resolve, reject) => {
      this.webTorrent.remove(torrent, (err?) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    return Promise.all([p1, p2]).then();
  }

  public findAllVideos(serverID: number): Promise<IVideo[]> {
    const { videos } = this.data[serverID];

    return Promise.resolve(videos);
  }

  public findVideoById(serverID: number, videoID: number): Promise<IVideo> {
    const { videos } = this.data[serverID];

    return Promise.resolve(videos[videoID]);
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

  private parseUrlFromFile(fileIndex: number, port: number, file: TorrentFile) {
    return (
      this.hostURL + ":" + port + "/" + fileIndex + "/" + encodeURI(file.name)
    );
  }

  private getVideos(torrent: Torrent, port: number): IVideo[] {
    const videos = [];
    let fileIndex = 0;
    for (const file of torrent.files) {
      if (isVideoFilename(file.name)) {
        videos.push({
          contentType: contentTypeFromFilename(file.name),
          filename: file.name,
          id: fileIndex,
          name: file.name,
          url: this.parseUrlFromFile(fileIndex, port, file),
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
}
