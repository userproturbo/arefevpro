export type AdminCharacterSection = "dashboard" | "projects" | "photo" | "video" | "audio" | "blog";

export const ADMIN_CHARACTER_SECTIONS: Array<{
  id: AdminCharacterSection;
  label: string;
  title: string;
  description: string;
  iconSrc: string;
}> = [
  {
    id: "dashboard",
    label: "Dashboard",
    title: "System Dashboard",
    description: "Visitor metrics, users table and online presence.",
    iconSrc: "/icons/home.svg",
  },
  {
    id: "blog",
    label: "Blog",
    title: "Blog Editor",
    description: "Manage blog entries and publishing.",
    iconSrc: "/icons/blog.svg",
  },
  {
    id: "audio",
    label: "Audio",
    title: "Audio Editor",
    description: "Manage music and audio posts.",
    iconSrc: "/icons/audio.svg",
  },
  {
    id: "photo",
    label: "Photo",
    title: "Photo Editor",
    description: "Manage albums, uploads and cover images.",
    iconSrc: "/icons/photo.svg",
  },
  {
    id: "video",
    label: "Video",
    title: "Video Editor",
    description: "Manage uploaded videos and publication state.",
    iconSrc: "/icons/video.svg",
  },
  {
    id: "projects",
    label: "Projects",
    title: "Projects Editor",
    description: "Manage project and about entries.",
    iconSrc: "/icons/Grid.svg",
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
