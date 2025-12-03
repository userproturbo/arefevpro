import { PostType } from "@prisma/client";

export type SectionInfo = {
  key: string;
  title: string;
  href: string;
  type: PostType;
};

const baseSections: Record<PostType, SectionInfo> = {
  [PostType.ABOUT]: {
    key: "about",
    title: "Обо мне",
    href: "/about",
    type: PostType.ABOUT,
  },
  [PostType.PHOTO]: {
    key: "photos",
    title: "Фото",
    href: "/photos",
    type: PostType.PHOTO,
  },
  [PostType.VIDEO]: {
    key: "videos",
    title: "Видео",
    href: "/videos",
    type: PostType.VIDEO,
  },
  [PostType.MUSIC]: {
    key: "music",
    title: "Музыка",
    href: "/music",
    type: PostType.MUSIC,
  },
  [PostType.BLOG]: {
    key: "blog",
    title: "Блог",
    href: "/blog",
    type: PostType.BLOG,
  },
};

export const SECTION_CONFIG: Record<string, SectionInfo> = {
  about: baseSections[PostType.ABOUT],
  photo: baseSections[PostType.PHOTO],
  photos: baseSections[PostType.PHOTO],
  video: baseSections[PostType.VIDEO],
  videos: baseSections[PostType.VIDEO],
  music: baseSections[PostType.MUSIC],
  blog: baseSections[PostType.BLOG],
};

export function getSectionConfig(section: string | undefined | null): SectionInfo | null {
  if (!section) return null;
  return SECTION_CONFIG[section.toLowerCase()] ?? null;
}

export function getSectionByType(type: PostType): SectionInfo | null {
  return baseSections[type] ?? null;
}
