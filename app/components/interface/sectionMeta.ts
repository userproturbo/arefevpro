import { AudioIcon, BlogIcon, PhotoIcon, RocketIcon, VideoIcon, type AppIcon } from "@/app/components/icons";
import type { SiteSection } from "@/app/types/siteSections";

export type SectionNavItem = {
  id: SiteSection;
  label: string;
  title: string;
  icon: AppIcon;
  soundSrc: string;
};

export const SECTION_NAV_ITEMS: SectionNavItem[] = [
  { id: "photo", label: "Photo", title: "Photo Archive", icon: PhotoIcon, soundSrc: "/audio/camera.mp3" },
  { id: "music", label: "Music", title: "Music Deck", icon: AudioIcon, soundSrc: "/audio/Music.mp3" },
  { id: "video", label: "Video", title: "Video Feed", icon: VideoIcon, soundSrc: "/audio/Phew-action.mp3" },
  { id: "blog", label: "Blog", title: "Blog Stream", icon: BlogIcon, soundSrc: "/audio/drawing.mp3" },
  { id: "projects", label: "Projects", title: "Projects Grid", icon: RocketIcon, soundSrc: "/audio/Drone.mp3" },
];

export function isCharacterNavSection(section: SiteSection | null): section is SiteSection {
  return (
    section === "photo" ||
    section === "music" ||
    section === "video" ||
    section === "blog" ||
    section === "projects"
  );
}

export function getSectionMeta(section: SiteSection | null) {
  if (isCharacterNavSection(section)) {
    return SECTION_NAV_ITEMS.find((item) => item.id === section) ?? SECTION_NAV_ITEMS[0];
  }

    return {
      id: null,
      label: "Home",
      title: "Home",
      icon: undefined,
      soundSrc: "",
    };
}
