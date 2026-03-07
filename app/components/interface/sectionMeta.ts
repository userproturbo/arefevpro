import type { Section } from "@/store/uiStore";

export type SectionMeta = {
  id: Section;
  label: string;
  title: string;
  icon: string;
  soundSrc: string;
};

export const SECTION_ITEMS: SectionMeta[] = [
  {
    id: "photo",
    label: "Photo",
    title: "Photo World",
    icon: "📷",
    soundSrc: "/audio/camera.mp3",
  },
  {
    id: "music",
    label: "Music",
    title: "Music World",
    icon: "🎧",
    soundSrc: "/audio/Music.mp3",
  },
  {
    id: "video",
    label: "Video",
    title: "Video World",
    icon: "🎥",
    soundSrc: "/audio/Phew-action.mp3",
  },
  {
    id: "drone",
    label: "Drone",
    title: "Drone World",
    icon: "🚁",
    soundSrc: "/audio/Drone.mp3",
  },
  {
    id: "blog",
    label: "Blog",
    title: "Blog Archive",
    icon: "✍️",
    soundSrc: "/audio/drawing.mp3",
  },
  {
    id: "projects",
    label: "Projects",
    title: "Projects",
    icon: "🧩",
    soundSrc: "/audio/Phew-idle.mp3",
  },
];

const SECTION_META_BY_ID = Object.fromEntries(
  SECTION_ITEMS.map((item) => [item.id, item]),
) as Record<Section, SectionMeta>;

export function getSectionMeta(section: Section): SectionMeta {
  return SECTION_META_BY_ID[section];
}
