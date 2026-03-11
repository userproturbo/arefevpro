export type SectionViewer =
  | { type: "blog"; slug: string }
  | { type: "photo"; slug: string }
  | {
      type: "video";
      video: {
        id: number;
        title: string;
        description: string | null;
        thumbnailUrl: string | null;
        videoUrl: string | null;
        embedUrl: string | null;
        likesCount: number;
        isLikedByMe: boolean;
      };
    }
  | null;
