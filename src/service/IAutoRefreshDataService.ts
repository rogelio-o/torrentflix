import { IEventEmitterInstance } from "./events/IEventEmitter";

export interface IAutoRefreshDataService {
  start(eventEmitterInstance: IEventEmitterInstance): void;
}
