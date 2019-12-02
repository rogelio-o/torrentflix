import { IDevicesService } from "../../../device/service/IDevicesService";
import { IRenderService, RenderAction } from "../../../renderer/IRenderService";
import { ITorrentService } from "../../../torrent/services/ITorrentService";
import { IPlayerService } from "../IPlayerService";

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
              this.rendererService.on(
                renderizationID,
                RenderAction.STOPPED,
                () => {
                  this.torrentService.destroyServer(torrentServerID);
                },
              );

              this.rendererService.play(renderizationID);

              return renderizationID;
            });
        });
    });
  }
}
