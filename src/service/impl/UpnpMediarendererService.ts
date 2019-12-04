import MediaRendererClient from "upnp-mediarenderer-client";

import { IDevice } from "../../entity/IDevice";
import { IRenderization, RenderizationStatus } from "../../entity/IRenderization";
import { IVideo } from "../../entity/IVideo";
import { IRenderService, RenderAction } from "../IRenderService";

export class UpnpMediaRendererService implements IRenderService {
  private data: IRenderizationWrapper[] = [];

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
          const renderization: IRenderization = {
            autoplay: true,
            deviceID: device.id,
            status: RenderizationStatus.PLAYING,
            torrentID: video.torrentID,
            videoID: video.id,
          };
          const renderizationID =
            this.data.push({
              client,
              renderization,
            }) - 1;

          client.on("loading", () => {
            renderization.status = RenderizationStatus.LOADING;

            this.runCallbacks(renderizationID, RenderAction.LOADING);
          });
          client.on("playing", () => {
            renderization.status = RenderizationStatus.PLAYING;

            this.startUpdatingPosition(renderizationID);

            this.runCallbacks(renderizationID, RenderAction.PLAYING);
          });
          client.on("paused", () => {
            renderization.status = RenderizationStatus.PAUSED;

            this.stopUpdatingPosition(renderizationID);

            this.runCallbacks(renderizationID, RenderAction.PAUSED);
          });
          client.on("stopped", () => {
            renderization.status = RenderizationStatus.STOPPED;

            this.stopUpdatingPosition(renderizationID);

            this.runCallbacks(renderizationID, RenderAction.STOPPED);
          });

          client.on("speedChanged", () =>
            this.runCallbacks(renderizationID, RenderAction.SPEED_CHANGED),
          );

          resolve(renderizationID);
        }
      });
    });
  }

  public play(renderizationID: number): Promise<void> {
    this.data[renderizationID].client.play();

    return Promise.resolve();
  }

  public pause(renderizationID: number): Promise<void> {
    this.data[renderizationID].client.pause();

    return Promise.resolve();
  }

  public stop(renderizationID: number): Promise<void> {
    const wrapper = this.data[renderizationID];
    wrapper.renderization.autoplay = false;
    wrapper.client.stop();

    return Promise.resolve();
  }

  public seek(renderizationID: number, seconds: number): Promise<void> {
    this.data[renderizationID].client.seek(seconds);

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

  public findAll(): Promise<IRenderization[]> {
    return Promise.resolve(this.data.map((w) => w.renderization));
  }

  public findById(renderizationID: number): Promise<IRenderization> {
    return Promise.resolve(this.data[renderizationID].renderization);
  }

  public autoplay(renderizationID: number, autoplay: boolean): Promise<void> {
    this.data[renderizationID].renderization.autoplay = autoplay;

    return Promise.resolve();
  }

  private startUpdatingPosition(renderizationID: number) {
    this.data[renderizationID].interval = setInterval(() => {
      const renderizationWrapper = this.data[renderizationID];
      const client = renderizationWrapper.client;
      const renderization = renderizationWrapper.renderization;

      client.getPosition((err: Error, position: number) => {
        if (err) {
          console.error(err);
        } else {
          renderization.position = position;
        }
      });

      client.getDuration((err: Error, duration: number) => {
        if (err) {
          console.error(err);
        } else {
          renderization.duration = duration;
        }
      });
    }, 1000);
  }

  private stopUpdatingPosition(renderizationID: number) {
    const inverval = this.data[renderizationID].interval;
    if (inverval) {
      clearInterval(inverval);
    }
  }

  private runCallbacks(renderizationID: number, action: RenderAction): void {
    if (this.callbacks[renderizationID]) {
      this.callbacks[renderizationID]
        .filter((c) => c.action === action)
        .forEach((c) => c.callback());
    }
  }
}

interface IRenderizationWrapper {
  renderization: IRenderization;

  client: any;

  interval?: any;
}

interface IRenderCallback {
  action: RenderAction;

  callback: () => void;
}
