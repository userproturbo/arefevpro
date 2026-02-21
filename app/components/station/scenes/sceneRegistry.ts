import type { StationSceneConfig, StationSceneId } from "@/types/stationScene";

export const SCENES: Record<StationSceneId, StationSceneConfig> = {
  home: {
    id: "home",
    label: "Home",
    modules: [],
    layout: "default",
  },
  blog: {
    id: "blog",
    label: "Blog",
    modules: ["StationBlogModule"],
    layout: "editorial",
  },
  photo: {
    id: "photo",
    label: "Photo",
    modules: ["StationPhotoModule"],
    layout: "media",
  },
  video: {
    id: "video",
    label: "Video",
    modules: ["StationVideoModule"],
    layout: "media",
  },
  audio: {
    id: "audio",
    label: "Audio",
    modules: ["StationAudioModule"],
    layout: "media",
  },
};
