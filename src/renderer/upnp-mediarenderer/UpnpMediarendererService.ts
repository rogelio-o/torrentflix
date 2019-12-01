import MediaRendererClient from "upnp-mediarenderer-client";

import { IDevice } from "../../common/entity/IDevice";
import { IVideo } from "../../common/entity/IVideo";
import { IRenderService, RenderAction } from "../IRenderService";
import { IRenderCallback } from "./entity/IRenderCallback";

export class UpnpMediaRendererService implements IRenderService {
  private data: any[] = [];

  private callbacks: {
    [id: number]: IRenderCallback[];
  } = {};

  public load(video: IVideo, device: IDevice): Promise<number> {
    const client = new MediaRendererClient(device.xmlUrl);
    const options = {
      autoplay: false,
      contentType: video.contentType,
      metadata: {
        title: video.name,
        type: "video",
      },
    };

    return new Promise((resolve, reject) => {
      client.load(video.url, options, (err: Error) => {
        if (err) {
          reject(err);
        } else {
          const renderizationID = this.data.push(client) - 1;

          client.on("loading", () =>
            this.runCallbacks(renderizationID, RenderAction.LOADING),
          );
          client.on("playing", () =>
            this.runCallbacks(renderizationID, RenderAction.PLAYING),
          );
          client.on("paused", () =>
            this.runCallbacks(renderizationID, RenderAction.PAUSED),
          );
          client.on("stopped", () =>
            this.runCallbacks(renderizationID, RenderAction.STOPPED),
          );
          client.on("speedChanged", () =>
            this.runCallbacks(renderizationID, RenderAction.SPEED_CHANGED),
          );

          resolve(renderizationID);
        }
      });
    });
  }

  public play(renderizationID: number): Promise<void> {
    this.data[renderizationID].play();

    return Promise.resolve();
  }

  public pause(renderizationID: number): Promise<void> {
    this.data[renderizationID].pause();

    return Promise.resolve();
  }

  public stop(renderizationID: number): Promise<void> {
    this.data[renderizationID].stop();

    return Promise.resolve();
  }

  public on(
    renderizationID: number,
    action: RenderAction,
    callback: () => void,
  ): void {
    if (!this.callbacks[renderizationID]) {
      this.callbacks[renderizationID] = [];
    }

    this.callbacks[renderizationID].push({ action, callback });
  }

  private runCallbacks(renderizationID: number, action: RenderAction): void {
    if (this.callbacks[renderizationID]) {
      this.callbacks[renderizationID]
        .filter((c) => c.action === action)
        .forEach((c) => c.callback());
    }
  }
}
