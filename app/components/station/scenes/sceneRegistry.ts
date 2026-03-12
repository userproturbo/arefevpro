import type { SiteSection } from "@/app/types/siteSections";
import type { StationSceneConfig } from "@/types/stationScene";

export const SCENES: Record<SiteSection, StationSceneConfig> = {
  blog: {
    id: "blog",
    label: "Blog",
    modules: ["blog"],
    layout: "editorial",
  },
  photo: {
    id: "photo",
    label: "Photo",
    modules: ["photo"],
    layout: "media",
  },
  video: {
    id: "video",
    label: "Video",
    modules: ["video"],
    layout: "media",
  },
  music: {
    id: "music",
    label: "Music",
    modules: ["music"],
    layout: "media",
  },
  projects: {
    id: "projects",
    label: "Projects",
    modules: ["projects"],
    layout: "default",
  },
};
