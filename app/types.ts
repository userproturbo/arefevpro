import type { MediaDTO } from "@/types/media";

export type UiPost = {
  id: number;
  slug: string;
  title: string;
  type: "ABOUT" | "PHOTO" | "VIDEO" | "MUSIC" | "BLOG";
  text: string | null;
  content?: unknown;
  coverMedia: MediaDTO | null;
  coverImage: string | null;
  mediaUrl: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
  liked?: boolean;
};
