import { PostType } from "@prisma/client";

export const ADMIN_POST_TYPES = {
  about: { label: "Обо мне", postType: PostType.ABOUT },
  photo: { label: "Фото", postType: PostType.PHOTO },
  video: { label: "Видео", postType: PostType.VIDEO },
  music: { label: "Музыка", postType: PostType.MUSIC },
  blog: { label: "Блог", postType: PostType.BLOG },
} as const;

export type AdminPostTypeKey = keyof typeof ADMIN_POST_TYPES;

export function getAdminType(
  raw?: string | null
): ({ key: AdminPostTypeKey } & (typeof ADMIN_POST_TYPES)[AdminPostTypeKey]) | null {
  if (!raw) return null;
  const key = raw.toLowerCase() as AdminPostTypeKey;
  const config = ADMIN_POST_TYPES[key];
  if (!config) return null;

  return { key, ...config };
}

export function postTypeToAdminKey(type: PostType): AdminPostTypeKey {
  switch (type) {
    case PostType.ABOUT:
      return "about";
    case PostType.PHOTO:
      return "photo";
    case PostType.VIDEO:
      return "video";
    case PostType.MUSIC:
      return "music";
    case PostType.BLOG:
    default:
      return "blog";
  }
}

export function getTypeLabel(type: AdminPostTypeKey | PostType): string {
  if (typeof type === "string" && type in ADMIN_POST_TYPES) {
    return ADMIN_POST_TYPES[type as AdminPostTypeKey].label;
  }

  return ADMIN_POST_TYPES[postTypeToAdminKey(type as PostType)].label;
}
