export interface IRendererClient {
  stop(): void;

  play(): void;

  pause(): void;

  seek(seconds: number): void;

  getPosition(): Promise<number>;

  getDuration(): Promise<number>;
}
