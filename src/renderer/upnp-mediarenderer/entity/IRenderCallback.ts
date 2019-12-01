import { RenderAction } from "../../IRenderService";

export interface IRenderCallback {
  action: RenderAction;

  callback: () => void;
}
