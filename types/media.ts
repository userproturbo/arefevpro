export type MediaDTO = {
  id: number;
  type: "IMAGE" | "VIDEO" | "AUDIO";
  url: string;
  width?: number;
  height?: number;
  durationSec?: number;
};
