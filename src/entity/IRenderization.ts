export interface IRenderization {
  deviceID: number;

  status: RenderizationStatus;

  torrentID: number;

  videoID: number;

  autoplay: boolean;

  position?: number;

  duration?: number;
}

export enum RenderizationStatus {
  PLAYING,
  STOPPED,
  PAUSED,
  LOADING,
}
