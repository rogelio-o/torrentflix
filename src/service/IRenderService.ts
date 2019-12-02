import { IDevice } from "../entity/IDevice";
import { IVideo } from "../entity/IVideo";

export interface IRenderService {
  load(video: IVideo, device: IDevice): Promise<number>;

  play(renderizationID: number): Promise<void>;

  pause(renderizationID: number): Promise<void>;

  stop(renderizationID: number): Promise<void>;

  on(renderizationID: number, action: RenderAction, callback: () => void): void;
}

export enum RenderAction {
  LOADING,
  PLAYING,
  PAUSED,
  STOPPED,
  SPEED_CHANGED,
}
