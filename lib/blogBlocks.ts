import type {
  BlogAlign,
  BlogAudioBlock,
  BlogBlock,
  BlogBlockBase,
  BlogBlockType,
  BlogHeadingBlock,
  BlogImageBlock,
  BlogLinkBlock,
  BlogParagraphBlock,
  BlogQuoteBlock,
  BlogVideoBlock,
  BlogVariant,
} from "@/types/blogBlocks";

export type {
  BlogAlign,
  BlogAudioBlock,
  BlogBlock,
  BlogBlockBase,
  BlogBlockType,
  BlogHeadingBlock,
  BlogImageBlock,
  BlogLinkBlock,
  BlogParagraphBlock,
  BlogQuoteBlock,
  BlogVariant,
  BlogVideoBlock,
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function asOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function asOptionalNumber(value: unknown): number | undefined {
  if (typeof value !== "number") return undefined;
  if (!Number.isFinite(value) || value <= 0) return undefined;
  return Math.floor(value);
}

function asOptionalAlign(value: unknown): BlogAlign | undefined {
  if (value === "normal" || value === "wide" || value === "full") {
    return value;
  }
  return undefined;
}

function asOptionalVariant(value: unknown): BlogVariant | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function resolveData(raw: Record<string, unknown>, type: BlogBlockType): Record<string, unknown> {
  const value = raw.data;
  if (isObject(value)) return value;

  // legacy flat format fallback
  if (type === "heading") {
    return {
      level: raw.level,
      text: raw.text,
    };
  }
  if (type === "paragraph") {
    return {
      text: raw.text,
    };
  }
  if (type === "image") {
    return {
      src: raw.src,
      mediaId: raw.mediaId,
      caption: raw.caption,
      alt: raw.alt,
    };
  }
  if (type === "video") {
    return {
      videoUrl: raw.videoUrl,
      embedUrl: raw.embedUrl,
      mediaId: raw.mediaId,
      caption: raw.caption,
    };
  }
  if (type === "audio") {
    return {
      src: raw.src,
      mediaId: raw.mediaId,
      caption: raw.caption,
    };
  }
  if (type === "quote") {
    return {
      text: raw.text,
      author: raw.author,
    };
  }
  return {
    href: raw.href,
    label: raw.label,
  };
}

export function isValidMediaUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const normalized = value.trim();
  if (!normalized) return false;
  if (normalized.startsWith("/")) return true;

  try {
    const url = new URL(normalized);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isAllowedVideoEmbedUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();

    const isYoutubeHost =
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtu.be" ||
      host.endsWith(".youtube.com");

    const isVimeoHost = host === "vimeo.com" || host.endsWith(".vimeo.com");

    return isYoutubeHost || isVimeoHost;
  } catch {
    return false;
  }
}

export function parseBlogBlock(raw: unknown): BlogBlock | null {
  if (!isObject(raw)) return null;

  const id = asNonEmptyString(raw.id);
  const type = asNonEmptyString(raw.type) as BlogBlockType | null;
  if (!id || !type) return null;

  const variant = asOptionalVariant(raw.variant);
  const align = asOptionalAlign(raw.align);
  const data = resolveData(raw, type);

  const base: Pick<BlogBlockBase, "id" | "type" | "variant" | "align"> = {
    id,
    type,
    ...(variant ? { variant } : {}),
    ...(align ? { align } : {}),
  };

  if (type === "heading") {
    const levelRaw = data.level;
    const level = levelRaw === 1 || levelRaw === 2 || levelRaw === 3 ? levelRaw : null;
    const text = asNonEmptyString(data.text);
    if (!level || !text) return null;
    return {
      ...base,
      type: "heading",
      data: { level, text },
    } as BlogHeadingBlock;
  }

  if (type === "paragraph") {
    const text = asNonEmptyString(data.text);
    if (!text) return null;
    return {
      ...base,
      type: "paragraph",
      data: { text },
    } as BlogParagraphBlock;
  }

  if (type === "image") {
    const src = asOptionalString(data.src);
    const mediaId = asOptionalNumber(data.mediaId);
    if (!src && !mediaId) return null;
    if (src && !isValidMediaUrl(src)) return null;

    return {
      ...base,
      type: "image",
      data: {
        ...(src ? { src } : {}),
        ...(mediaId ? { mediaId } : {}),
        ...(asOptionalString(data.caption) ? { caption: asOptionalString(data.caption) } : {}),
        ...(asOptionalString(data.alt) ? { alt: asOptionalString(data.alt) } : {}),
      },
    } as BlogImageBlock;
  }

  if (type === "video") {
    const videoUrl = asOptionalString(data.videoUrl);
    const embedUrl = asOptionalString(data.embedUrl);
    const mediaId = asOptionalNumber(data.mediaId);

    if (!videoUrl && !embedUrl && !mediaId) return null;
    if (videoUrl && !isValidMediaUrl(videoUrl)) return null;
    if (embedUrl && (!isValidMediaUrl(embedUrl) || !isAllowedVideoEmbedUrl(embedUrl))) {
      return null;
    }

    return {
      ...base,
      type: "video",
      data: {
        ...(videoUrl ? { videoUrl } : {}),
        ...(embedUrl ? { embedUrl } : {}),
        ...(mediaId ? { mediaId } : {}),
        ...(asOptionalString(data.caption) ? { caption: asOptionalString(data.caption) } : {}),
      },
    } as BlogVideoBlock;
  }

  if (type === "audio") {
    const src = asOptionalString(data.src);
    const mediaId = asOptionalNumber(data.mediaId);
    if (!src && !mediaId) return null;
    if (src && !isValidMediaUrl(src)) return null;

    return {
      ...base,
      type: "audio",
      data: {
        ...(src ? { src } : {}),
        ...(mediaId ? { mediaId } : {}),
        ...(asOptionalString(data.caption) ? { caption: asOptionalString(data.caption) } : {}),
      },
    } as BlogAudioBlock;
  }

  if (type === "quote") {
    const text = asNonEmptyString(data.text);
    if (!text) return null;
    return {
      ...base,
      type: "quote",
      data: {
        text,
        ...(asOptionalString(data.author) ? { author: asOptionalString(data.author) } : {}),
      },
    } as BlogQuoteBlock;
  }

  const href = asNonEmptyString(data.href);
  const label = asNonEmptyString(data.label);
  if (!href || !label || !isValidMediaUrl(href)) return null;
  return {
    ...base,
    type: "link",
    data: { href, label },
  } as BlogLinkBlock;
}

export function parseBlogContent(raw: unknown): BlogBlock[] | null {
  if (!Array.isArray(raw)) return null;

  const blocks: BlogBlock[] = [];
  for (const item of raw) {
    const block = parseBlogBlock(item);
    if (!block) {
      return null;
    }
    blocks.push(block);
  }

  return blocks;
}
