import { IRenderization } from "../entity/IRenderization";

export interface IPlayerService {
  attach(
    deviceID: string,
    torrentID: string,
    videoID: string,
  ): Promise<IRenderization>;
}
