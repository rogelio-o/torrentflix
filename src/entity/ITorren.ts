export interface ITorrent {
  id: string;

  name: string;

  magnetUri: string;

  downloaded: number;

  downloadedPerentage: number;

  downloadSpeed: number;

  uploadSpeed: number;
}
