import type { ComponentType } from "react";
import type { SiteSection } from "@/app/types/siteSections";
import StationAudioModule from "./StationAudioModule";
import StationBlogModule from "./StationBlogModule";
import StationPhotoModule from "./StationPhotoModule";
import StationProjectsModule from "./StationProjectsModule";
import StationVideoModule from "./StationVideoModule";

export const MODULE_REGISTRY: Record<SiteSection, ComponentType> = {
  blog: StationBlogModule,
  photo: StationPhotoModule,
  video: StationVideoModule,
  music: StationAudioModule,
  projects: StationProjectsModule,
};
