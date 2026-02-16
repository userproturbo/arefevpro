export type AdminSectionKey =
  | "idle"
  | "projects"
  | "photo"
  | "video"
  | "audio"
  | "blog";

export type AdminSectionInfo = {
  key: AdminSectionKey;
  label: string;
  href: string;
  description: string;
};

export const ADMIN_STATION_SECTIONS: AdminSectionInfo[] = [
  {
    key: "idle",
    label: "Idle",
    href: "/admin/idle",
    description: "Section-based content management dashboard.",
  },
  {
    key: "projects",
    label: "Projects",
    href: "/admin/projects",
    description: "Manage project/about entries.",
  },
  {
    key: "photo",
    label: "Photo",
    href: "/admin/photo",
    description: "Manage albums and photos.",
  },
  {
    key: "video",
    label: "Video",
    href: "/admin/video",
    description: "Manage uploaded videos.",
  },
  {
    key: "audio",
    label: "Audio",
    href: "/admin/audio",
    description: "Manage music/audio entries.",
  },
  {
    key: "blog",
    label: "Blog",
    href: "/admin/blog",
    description: "Manage blog posts and publication status.",
  },
];

export function getAdminSection(section: string | null | undefined): AdminSectionInfo | null {
  if (!section) return null;
  const normalized = section.toLowerCase();
  return ADMIN_STATION_SECTIONS.find((item) => item.key === normalized) ?? null;
}
