import { IRenderization } from "../../entity/IRenderization";
import { IEventEmitterInstance } from "../events/IEventEmitter";
import { IDevicesService } from "../IDevicesService";
import { IPlayerService } from "../IPlayerService";
import { IRenderService } from "../IRenderService";
import { ITorrentService } from "../ITorrentService";

export class PlayerServiceImpl implements IPlayerService {
  private devicesService: IDevicesService;
  private torrentService: ITorrentService;
  private rendererService: IRenderService;

  constructor(
    devicesService: IDevicesService,
    torrentService: ITorrentService,
    rendererService: IRenderService,
  ) {
    this.devicesService = devicesService;
    this.torrentService = torrentService;
    this.rendererService = rendererService;
  }

  public attach(
    eventEmitterInstance: IEventEmitterInstance,
    deviceID: string,
    torrentID: string,
    videoID: string,
  ): Promise<IRenderization> {
    return this.devicesService.getDevice(deviceID).then((device) => {
      return this.torrentService
        .findVideoById(torrentID, videoID)
        .then((video) => {
          return this.rendererService
            .load(eventEmitterInstance, video, device)
            .then((renderization) => {
              this.rendererService.play(renderization.id);

              return renderization;
            });
        });
    });
  }
}
