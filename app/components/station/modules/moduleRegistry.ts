import StationAudioModule from "./StationAudioModule";
import StationBlogModule from "./StationBlogModule";
import StationPhotoModule from "./StationPhotoModule";
import StationVideoModule from "./StationVideoModule";

export const MODULE_REGISTRY = {
  StationBlogModule,
  StationPhotoModule,
  StationVideoModule,
  StationAudioModule,
};

export type StationModuleName = keyof typeof MODULE_REGISTRY;
