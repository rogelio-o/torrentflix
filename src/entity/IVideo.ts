export interface IVideo {
  id: string;

  torrentID: string;

  filename: string;

  name: string;

  contentType: string;

  url: string;

  downloaded: number;

  downloadedPerentage: number;

  length: number;
}
