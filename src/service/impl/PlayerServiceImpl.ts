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
    torrentServerID: number,
    videoID: number,
  ): Promise<number> {
    return this.devicesService.getDevice(deviceID).then((device) => {
      return this.torrentService
        .findVideoById(torrentServerID, videoID)
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
