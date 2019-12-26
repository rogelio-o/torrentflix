import { IRenderization } from "../entity/IRenderization";
import { IEventEmitterInstance } from "./events/IEventEmitter";

export interface IPlayerService {
  attach(
    eventEmitterInstance: IEventEmitterInstance,
    deviceID: string,
    torrentID: string,
    videoID: string,
  ): Promise<IRenderization>;
}
