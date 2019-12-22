import MediaRendererClient from "upnp-mediarenderer-client";

import { IDevice } from "../../entity/IDevice";
import { IRendererClient } from "../../entity/IRendererClient";
import { IVideo } from "../../entity/IVideo";
import { IRenderer, IRenderizationCallbacks } from "./IRenderer";

export class DlnaRenderer implements IRenderer {
  public play(
    video: IVideo,
    device: IDevice,
    callbacks: IRenderizationCallbacks,
  ): Promise<IRendererClient> {
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
          client.on("loading", () => callbacks.loading());
          client.on("playing", () => callbacks.playing());
          client.on("paused", () => callbacks.paused());
          client.on("stopped", () => callbacks.stopped());
          client.on("error", () => callbacks.error());
          client.on("speedChanged", () => callbacks.speedChanged());

          resolve({
            getDuration: (): Promise<number> => {
              return new Promise((resolve2, reject2) => {
                client.getDuration((err2: Error, duration: number) => {
                  if (err2) {
                    reject2(err2);
                  } else {
                    resolve2(duration);
                  }
                });
              });
            },
            getPosition: () => {
              return new Promise((resolve2, reject2) => {
                client.getPosition((err2: Error, position: number) => {
                  if (err2) {
                    reject2(err2);
                  } else {
                    resolve2(position);
                  }
                });
              });
            },
            pause: () => client.pause(),
            play: () => client.play(),
            seek: (seconds) => client.seek(seconds),
            stop: () => client.stop(),
          });
        }
      });
    });
  }
}
