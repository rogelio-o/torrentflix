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

  public load(
    deviceID: number,
    torrentID: number,
    videoID: number,
  ): Promise<number> {
    return this.devicesService.getDevice(deviceID).then((device) => {
      return this.torrentService
        .findVideoById(torrentID, videoID)
        .then((video) => {
          return this.rendererService
            .load(video, device)
            .then((renderizationID) => {
              this.rendererService.play(renderizationID);

              return renderizationID;
            });
        });
    });
  }
}
