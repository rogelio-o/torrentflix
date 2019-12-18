export interface IRenderization {
  id: string;

  deviceID: string;

  status: RenderizationStatus;

  torrentID: string;

  videoID: string;

  position?: number;

  duration?: number;
}

export enum RenderizationStatus {
  PLAYING,
  STOPPED,
  PAUSED,
  LOADING,
  ERROR,
}
