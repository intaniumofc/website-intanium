export type PhotoboothState =
  | "SELECT_FRAME"
  | "SELECT_INPUT_MODE"
  | "REQUESTING_CAMERA"
  | "CAMERA_ERROR"
  | "LIVE_PREVIEW"
  | "COUNTDOWN"
  | "CAPTURING"
  | "CONFIRM_CAPTURE"
  | "UPLOAD_PREVIEW"
  | "REVIEW"
  | "EXPORTING";

export interface Slot {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export interface FrameConfig {
  id: string;
  name: string;
  thumbnail: string;
  src: string;
  canvasWidth: number;
  canvasHeight: number;
  slots: Slot[];
  watermark: {
    logo: string;
    text: string;
    position: "bottom-per-panel" | "bottom-global";
  };
}
