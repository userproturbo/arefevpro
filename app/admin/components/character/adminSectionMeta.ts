import { AudioIcon, BlogIcon, HomeIcon, PhotoIcon, RocketIcon, VideoIcon, type AppIcon } from "@/app/components/icons";

export type AdminCharacterSection = "dashboard" | "projects" | "photo" | "video" | "audio" | "blog";

export const ADMIN_CHARACTER_SECTIONS: Array<{
  id: AdminCharacterSection;
  label: string;
  title: string;
  description: string;
  icon: AppIcon;
}> = [
  {
    id: "dashboard",
    label: "Dashboard",
    title: "System Dashboard",
    description: "Visitor metrics, users table and online presence.",
    icon: HomeIcon,
  },
  {
    id: "blog",
    label: "Blog",
    title: "Blog Editor",
    description: "Manage blog entries and publishing.",
    icon: BlogIcon,
  },
  {
    id: "audio",
    label: "Audio",
    title: "Audio Editor",
    description: "Manage music and audio posts.",
    icon: AudioIcon,
  },
  {
    id: "photo",
    label: "Photo",
    title: "Photo Editor",
    description: "Manage albums, uploads and cover images.",
    icon: PhotoIcon,
  },
  {
    id: "video",
    label: "Video",
    title: "Video Editor",
    description: "Manage uploaded videos and publication state.",
    icon: VideoIcon,
  },
  {
    id: "projects",
    label: "Projects",
    title: "Projects Editor",
    description: "Manage project and about entries.",
    icon: RocketIcon,
  },
];

export function getAdminCharacterSection(section: string | null | undefined): AdminCharacterSection {
  if (section === "projects" || section === "photo" || section === "video" || section === "audio" || section === "blog") {
    return section;
  }

  return "dashboard";
}

export function getAdminCharacterSectionMeta(section: AdminCharacterSection) {
  return ADMIN_CHARACTER_SECTIONS.find((item) => item.id === section) ?? ADMIN_CHARACTER_SECTIONS[0];
}
