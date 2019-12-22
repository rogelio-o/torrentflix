import castv2 from "castv2-client";

import { IDevice } from "../../entity/IDevice";
import { IRendererClient } from "../../entity/IRendererClient";
import { IVideo } from "../../entity/IVideo";
import { IRenderer, IRenderizationCallbacks } from "./IRenderer";

const calcConnectOptionsFromXmlUrl = (
  xmlUrl: string,
): { [key: string]: any } => {
  const host = xmlUrl.replace(/^https?:\/\//, "").replace(/:\d+\/.+/, "");
  const port = parseInt(
    xmlUrl.replace(/^https?:\/\/.+:/, "").replace(/\/.+/, ""),
    10,
  );

  return {
    host,
    port,
  };
};

export class ChromecastRenderer implements IRenderer {
  public play(
    video: IVideo,
    device: IDevice,
    callbacks: IRenderizationCallbacks,
  ): Promise<IRendererClient> {
    const client = new castv2.Client();
    let position = 0;
    let duration = 0;

    return new Promise((resolve, reject) => {
      client.connect(calcConnectOptionsFromXmlUrl(device.xmlUrl), () => {
        client.on("error", () => callbacks.error());

        client.launch(
          castv2.DefaultMediaReceiver,
          (err: Error, player: any) => {
            if (err) {
              reject(err);
            } else {
              const media = {
                contentId: video.url,
                contentType: video.contentType,
                metadata: {
                  title: video.name,
                },
                streamType: "BUFFERED",
              };

              player.on("status", (status: any) => {
                if (status.media) {
                  duration = status.media.duration;
                }

                position = status.currentTime;

                switch (status.playerState) {
                  case "BUFFERING":
                  case "IDLE":
                    callbacks.loading();
                    break;
                  case "PAUSED":
                    callbacks.paused();
                    break;
                  case "PLAYING":
                    callbacks.playing();
                    break;
                }
              });

              player.load(media, { autoplay: false }, (err2: Error) => {
                if (err2) {
                  reject(err2);
                } else {
                  resolve({
                    getDuration: () => Promise.resolve(duration),
                    getPosition: () => Promise.resolve(position),
                    pause: () => player.pause(),
                    play: () => player.play(),
                    seek: (seconds) => player.seek(seconds),
                    stop: () => {
                      player.stop();
                      client.close();
                    },
                  });
                }
              });
            }
          },
        );
      });
    });
  }
}
