import ws from "ws";

import { IEventEmitter, IEventEmitterInstance } from "../IEventEmitter";
import { WsEventEmitterInstance } from "./WsEventEmitterInstance";

export class WsEventEmitter implements IEventEmitter {
  private wsServer: ws.Server;

  constructor(wsServer: ws.Server) {
    this.wsServer = wsServer;
  }

  public instance(): IEventEmitterInstance {
    return new WsEventEmitterInstance(this.wsServer);
  }
}
