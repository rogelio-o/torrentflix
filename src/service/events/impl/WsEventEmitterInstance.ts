import ws from "ws";

import { IEvent } from "../../../entity/events/IEvent";
import { IEventEmitterInstance } from "../IEventEmitter";

export class WsEventEmitterInstance implements IEventEmitterInstance {
  private wsServer: ws.Server;

  private events: IEvent[] = [];

  constructor(wsServer: ws.Server) {
    this.wsServer = wsServer;
  }

  public add(event: IEvent): void {
    this.events.push(event);
  }

  public addAndEmit(event: IEvent): void {
    this.add(event);
    this.emit();
  }

  public clear(): void {
    this.events = [];
  }

  public emit(): void {
    const events = this.events;
    this.clear();
    events.forEach((event) =>
      this.wsServer.clients.forEach((client) =>
        client.send(JSON.stringify(event)),
      ),
    );
  }
}
