import { IDevice } from "../../entity/IDevice";
import { IVideo } from "../../entity/IVideo";

export interface IRenderer {
  play(
    video: IVideo,
    device: IDevice,
    callbacks: IRenderizationCallbacks,
  ): Promise<void>;
}

export interface IRenderizationCallbacks {
  loading(): void;

  playing(): void;

  paused(): void;

  stopped(): void;

  error(): void;

  speedChanged(): void;
}
