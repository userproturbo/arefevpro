import type { Section } from "@/store/uiStore";

export type CharacterNavSection = "photo" | "music" | "video" | "blog";

export type SectionNavItem = {
  id: CharacterNavSection;
  label: string;
  title: string;
  iconSrc: string;
  soundSrc: string;
};

export const SECTION_NAV_ITEMS: SectionNavItem[] = [
  { id: "photo", label: "Photo", title: "Photo Archive", iconSrc: "/icons/photo.svg", soundSrc: "/audio/camera.mp3" },
  { id: "music", label: "Music", title: "Music Deck", iconSrc: "/icons/audio.svg", soundSrc: "/audio/Music.mp3" },
  { id: "video", label: "Video", title: "Video Feed", iconSrc: "/icons/video.svg", soundSrc: "/audio/Phew-action.mp3" },
  { id: "blog", label: "Blog", title: "Blog Stream", iconSrc: "/icons/blog.svg", soundSrc: "/audio/drawing.mp3" },
];

export function isCharacterNavSection(section: Section | null): section is CharacterNavSection {
  return section === "photo" || section === "music" || section === "video" || section === "blog";
}

export function getSectionMeta(section: Section | null) {
  if (isCharacterNavSection(section)) {
    return SECTION_NAV_ITEMS.find((item) => item.id === section) ?? SECTION_NAV_ITEMS[0];
  }

  return {
    id: null,
    label: "Home",
    title: "Home",
    iconSrc: "/icons/home.svg",
    soundSrc: "",
  };
}
