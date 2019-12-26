import { IDevice } from "../entity/IDevice";
import { IRenderization } from "../entity/IRenderization";
import { IVideo } from "../entity/IVideo";
import { IEventEmitterInstance } from "./events/IEventEmitter";

export interface IRenderService {
  load(
    eventEmitterInstance: IEventEmitterInstance,
    video: IVideo,
    device: IDevice,
  ): Promise<IRenderization>;

  play(renderizationID: string): Promise<void>;

  pause(renderizationID: string): Promise<void>;

  stop(renderizationID: string): Promise<void>;

  seek(renderizationID: string, seconds: number): Promise<void>;

  on(renderizationID: string, action: RenderAction, callback: () => void): void;

  findAll(): Promise<IRenderization[]>;

  findById(renderizationID: string): Promise<IRenderization>;
}

export enum RenderAction {
  LOADING,
  PLAYING,
  PAUSED,
  STOPPED,
  SPEED_CHANGED,
  ERROR,
}
