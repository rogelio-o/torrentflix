import uuidv4 from "uuid/v4";

import { logger } from "../../config/logger";
import { IRenderizationLoaded } from "../../entity/events/IRenderizationLoaded";
import { IRenderizationPositionUpdated } from "../../entity/events/IRenderizationPositionUpdated";
import { IRenderizationStatusUpdated } from "../../entity/events/IRenderizationStatusUpdated";
import { DeviceType, IDevice } from "../../entity/IDevice";
import { IRendererClient } from "../../entity/IRendererClient";
import { IRenderization, RenderizationStatus } from "../../entity/IRenderization";
import { IVideo } from "../../entity/IVideo";
import { IEventEmitterInstance } from "../events/IEventEmitter";
import { IRenderService, RenderAction } from "../IRenderService";
import { ChromecastRenderer } from "../media-render/ChromecastRenderer";
import { DlnaRenderer } from "../media-render/DlnaRenderer";
import { IRenderer } from "../media-render/IRenderer";

const parseRendererKey = (deviceType: DeviceType): string => {
  if (deviceType === DeviceType.CHROMECAST) {
    return "chromecast";
  } else {
    return "dlna";
  }
};

export class MediaRendererServiceImpl implements IRenderService {
  private data: { [id: string]: IRenderizationWrapper } = {};

  private callbacks: {
    [id: string]: IRenderCallback[];
  } = {};

  private renderers: { [type: string]: IRenderer } = {
    chromecast: new ChromecastRenderer(),
    dlna: new DlnaRenderer(),
  };

  public async load(
    eventEmitterInstance: IEventEmitterInstance,
    video: IVideo,
    device: IDevice,
  ): Promise<IRenderization> {
    const renderizationID = uuidv4();
    const renderization: IRenderization = {
      deviceID: device.id,
      id: renderizationID,
      status: RenderizationStatus.PLAYING,
      torrentID: video.torrentID,
      videoID: video.id,
    };

    const renderer = this.renderers[parseRendererKey(device.type)];
    const client = await renderer.play(video, device, {
      error: () => {
        const oldStatus = renderization.status;
        renderization.status = RenderizationStatus.ERROR;
        eventEmitterInstance.addAndEmit(
          this.buildRenderizationStatusUpdated(renderization, oldStatus),
        );

        this.runCallbacks(renderizationID, RenderAction.STOPPED);

        this.removeRenderization(renderization.id);
      },
      loading: () => {
        const oldStatus = renderization.status;
        renderization.status = RenderizationStatus.LOADING;
        eventEmitterInstance.addAndEmit(
          this.buildRenderizationStatusUpdated(renderization, oldStatus),
        );

        this.runCallbacks(renderizationID, RenderAction.LOADING);
      },
      paused: () => {
        const oldStatus = renderization.status;
        renderization.status = RenderizationStatus.PAUSED;
        eventEmitterInstance.addAndEmit(
          this.buildRenderizationStatusUpdated(renderization, oldStatus),
        );

        this.runCallbacks(renderizationID, RenderAction.PAUSED);

        this.stopUpdatingPosition(renderizationID);
      },
      playing: () => {
        const oldStatus = renderization.status;
        renderization.status = RenderizationStatus.PLAYING;
        eventEmitterInstance.addAndEmit(
          this.buildRenderizationStatusUpdated(renderization, oldStatus),
        );

        this.startUpdatingPosition(eventEmitterInstance, renderizationID);

        this.runCallbacks(renderizationID, RenderAction.PLAYING);
      },
      speedChanged: () => {
        this.runCallbacks(renderizationID, RenderAction.SPEED_CHANGED);
      },
      stopped: () => {
        const oldStatus = renderization.status;
        renderization.status = RenderizationStatus.STOPPED;
        eventEmitterInstance.addAndEmit(
          this.buildRenderizationStatusUpdated(renderization, oldStatus),
        );

        this.runCallbacks(renderizationID, RenderAction.STOPPED);

        this.removeRenderization(renderizationID);
      },
    });

    this.data[renderizationID] = {
      client,
      renderization,
    };

    const loadedEvent: IRenderizationLoaded = {
      emittedOn: new Date(),
      event: "renderization-loaded",
      renderizationId: renderization.id,
    };
    eventEmitterInstance.add(loadedEvent);

    return renderization;
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

  private startUpdatingPosition(
    eventEmitterInstance: IEventEmitterInstance,
    renderizationID: string,
  ) {
    if (this.data[renderizationID]) {
      const interval = setInterval(async () => {
        if (this.data[renderizationID]) {
          const renderizationWrapper = this.data[renderizationID];
          const client = renderizationWrapper.client;
          const renderization = renderizationWrapper.renderization;

          try {
            const [position, duration] = await Promise.all([
              client.getPosition(),
              client.getDuration(),
            ]);

            renderization.position = position;
            renderization.duration = duration;

            eventEmitterInstance.addAndEmit(
              this.buildRenderizationPositionUpdated(renderization),
            );
          } catch (e) {
            logger.error(e);
          }
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

  private buildRenderizationStatusUpdated(
    renderization: IRenderization,
    oldStatus: RenderizationStatus,
  ): IRenderizationStatusUpdated {
    return {
      emittedOn: new Date(),
      event: "renderization-status-updated",
      newStatus: renderization.status,
      oldStatus,
      renderizationId: renderization.id,
    };
  }

  private buildRenderizationPositionUpdated(
    renderization: IRenderization,
  ): IRenderizationPositionUpdated {
    return {
      duration: renderization.duration || 0,
      emittedOn: new Date(),
      event: "renderization-position-updated",
      position: renderization.position || 0,
      renderizationId: renderization.id,
    };
  }
}

interface IRenderizationWrapper {
  renderization: IRenderization;

  client: IRendererClient;

  interval?: any;
}

interface IRenderCallback {
  action: RenderAction;

  callback: () => void;
}
