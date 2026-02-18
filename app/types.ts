export type UiPost = {
  id: number;
  slug: string;
  title: string;
  type: "ABOUT" | "PHOTO" | "VIDEO" | "MUSIC" | "BLOG";
  text: string | null;
  content?: unknown;
  coverImage: string | null;
  mediaUrl: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
  liked?: boolean;
};
