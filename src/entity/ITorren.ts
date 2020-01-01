export interface ITorrent {
  id: string;

  name: string;

  magnetUri: string;

  size: number;

  downloaded: number;

  downloadedPerentage: number;

  downloadSpeed: number;

  uploadSpeed: number;

  numPeers: number;
}
