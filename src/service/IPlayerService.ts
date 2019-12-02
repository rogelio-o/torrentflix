export interface IPlayerService {
  load(
    deviceID: number,
    torrentServerID: number,
    videoID: number,
  ): Promise<number>;
}
