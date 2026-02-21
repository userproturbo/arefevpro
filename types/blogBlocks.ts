export type BlogBlockType =
  | "heading"
  | "paragraph"
  | "image"
  | "video"
  | "audio"
  | "quote"
  | "link";

export type BlogAlign = "normal" | "wide" | "full";

export type BlogVariant = string;

export type BlogBlockBase = {
  id: string;
  type: BlogBlockType;
  data: any;
  variant?: BlogVariant;
  align?: BlogAlign;
};

export type BlogHeadingBlock = BlogBlockBase & {
  type: "heading";
  data: {
    level: 1 | 2 | 3;
    text: string;
  };
};

export type BlogParagraphBlock = BlogBlockBase & {
  type: "paragraph";
  data: {
    text: string;
  };
};

export type BlogImageBlock = BlogBlockBase & {
  type: "image";
  data: {
    src?: string;
    mediaId?: number;
    caption?: string;
    alt?: string;
  };
};

export type BlogVideoBlock = BlogBlockBase & {
  type: "video";
  data: {
    videoUrl?: string;
    embedUrl?: string;
    mediaId?: number;
    caption?: string;
  };
};

export type BlogAudioBlock = BlogBlockBase & {
  type: "audio";
  data: {
    src?: string;
    mediaId?: number;
    caption?: string;
  };
};

export type BlogQuoteBlock = BlogBlockBase & {
  type: "quote";
  data: {
    text: string;
    author?: string;
  };
};

export type BlogLinkBlock = BlogBlockBase & {
  type: "link";
  data: {
    href: string;
    label: string;
  };
};

export type BlogBlock =
  | BlogHeadingBlock
  | BlogParagraphBlock
  | BlogImageBlock
  | BlogVideoBlock
  | BlogAudioBlock
  | BlogQuoteBlock
  | BlogLinkBlock;

export type RenderInstruction = BlogBlockBase & {
  computed: {
    variant: BlogVariant;
    align: BlogAlign;
    className?: string;
  };
};
