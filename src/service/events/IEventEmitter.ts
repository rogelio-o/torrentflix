import { IEvent } from "../../entity/events/IEvent";

export interface IEventEmitter {
  instance(): IEventEmitterInstance;
}

export interface IEventEmitterInstance {
  add(event: IEvent): void;

  addAndEmit(event: IEvent): void;

  clear(): void;

  emit(): void;
}
