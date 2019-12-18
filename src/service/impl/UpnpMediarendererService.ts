import MediaRendererClient from "upnp-mediarenderer-client";
import uuidv4 from "uuid/v4";

import { IDevice } from "../../entity/IDevice";
import { IRenderization, RenderizationStatus } from "../../entity/IRenderization";
import { IVideo } from "../../entity/IVideo";
import { IRenderService, RenderAction } from "../IRenderService";

export class UpnpMediaRendererService implements IRenderService {
  private data: { [id: string]: IRenderizationWrapper } = {};

  private callbacks: {
    [id: string]: IRenderCallback[];
  } = {};

  public load(video: IVideo, device: IDevice): Promise<IRenderization> {
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
          const renderizationID = uuidv4();
          const renderization: IRenderization = {
            deviceID: device.id,
            id: renderizationID,
            status: RenderizationStatus.PLAYING,
            torrentID: video.torrentID,
            videoID: video.id,
          };
          this.data[renderizationID] = {
            client,
            renderization,
          };

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

            this.runCallbacks(renderizationID, RenderAction.PAUSED);

            this.stopUpdatingPosition(renderizationID);
          });
          client.on("stopped", () => {
            renderization.status = RenderizationStatus.STOPPED;

            this.runCallbacks(renderizationID, RenderAction.STOPPED);

            this.removeRenderization(renderizationID);
          });
          client.on("error", () => {
            renderization.status = RenderizationStatus.ERROR;

            this.runCallbacks(renderizationID, RenderAction.STOPPED);

            this.removeRenderization(renderization.id);
          });
          client.on("speedChanged", () =>
            this.runCallbacks(renderizationID, RenderAction.SPEED_CHANGED),
          );

          resolve(renderization);
        }
      });
    });
  }

  public play(renderizationID: string): Promise<void> {
    this.data[renderizationID].client.play();

    return Promise.resolve();
  }

  public pause(renderizationID: string): Promise<void> {
    this.data[renderizationID].client.pause();

    return Promise.resolve();
  }

  public stop(renderizationID: string): Promise<void> {
    const wrapper = this.data[renderizationID];
    wrapper.client.stop();

    this.removeRenderization(renderizationID);

    return Promise.resolve();
  }

  public seek(renderizationID: string, seconds: number): Promise<void> {
    this.data[renderizationID].client.seek(Math.floor(seconds));

    return Promise.resolve();
  }

  public on(
    renderizationID: string,
    action: RenderAction,
    callback: () => void,
  ): void {
    if (!this.callbacks[renderizationID]) {
      this.callbacks[renderizationID] = [];
    }

    this.callbacks[renderizationID].push({ action, callback });
  }

  public findAll(): Promise<IRenderization[]> {
    return Promise.resolve(
      Object.values(this.data).map((w) => w.renderization),
    );
  }

  public findById(renderizationID: string): Promise<IRenderization> {
    return Promise.resolve(this.data[renderizationID].renderization);
  }

  private startUpdatingPosition(renderizationID: string) {
    if (this.data[renderizationID]) {
      const interval = setInterval(() => {
        if (this.data[renderizationID]) {
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
        } else {
          clearInterval(interval);
        }
      }, 1000);
      this.data[renderizationID].interval = interval;
    }
  }

  private removeRenderization(renderizationID: string) {
    if (this.data[renderizationID]) {
      this.stopUpdatingPosition(renderizationID);
      delete this.data[renderizationID];
    }
  }

  private stopUpdatingPosition(renderizationID: string) {
    const inverval = (this.data[renderizationID] || {}).interval;
    if (inverval) {
      clearInterval(inverval);
    }
  }

  private runCallbacks(renderizationID: string, action: RenderAction): void {
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
