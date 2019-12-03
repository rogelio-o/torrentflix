export interface IVideo {
  id: number;

  torrentID: number;

  filename: string;

  name: string;

  contentType: string;

  url: string;

  downloaded: number;

  downloadedPerentage: number;

  length: number;
}
