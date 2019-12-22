import { IDevice } from "../../entity/IDevice";
import { IRendererClient } from "../../entity/IRendererClient";
import { IVideo } from "../../entity/IVideo";

export interface IRenderer {
  play(
    video: IVideo,
    device: IDevice,
    callbacks: IRenderizationCallbacks,
  ): Promise<IRendererClient>;
}

export interface IRenderizationCallbacks {
  loading(): void;

  playing(): void;

  paused(): void;

  stopped(): void;

  error(): void;

  speedChanged(): void;
}
