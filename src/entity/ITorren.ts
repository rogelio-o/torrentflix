export interface ITorrent {
  name: string;

  magnetUri: string;

  downloaded: number;

  downloadedPerentage: number;

  downloadSpeed: number;

  uploadSpeed: number;
}
