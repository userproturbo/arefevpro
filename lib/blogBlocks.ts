export type BlogBlock =
  | {
      id: string;
      type: "heading";
      level: 1 | 2 | 3;
      text: string;
    }
  | {
      id: string;
      type: "paragraph";
      text: string;
    }
  | {
      id: string;
      type: "image";
      src: string;
      caption?: string;
    }
  | {
      id: string;
      type: "video";
      videoUrl?: string;
      embedUrl?: string;
      caption?: string;
    }
  | {
      id: string;
      type: "audio";
      src: string;
      caption?: string;
    }
  | {
      id: string;
      type: "quote";
      text: string;
      author?: string;
    }
  | {
      id: string;
      type: "link";
      href: string;
      label: string;
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
  const type = asNonEmptyString(raw.type);
  if (!id || !type) return null;

  if (type === "heading") {
    const levelRaw = raw.level;
    const level = levelRaw === 1 || levelRaw === 2 || levelRaw === 3 ? levelRaw : null;
    const text = asNonEmptyString(raw.text);
    if (!level || !text) return null;
    return { id, type: "heading", level, text };
  }

  if (type === "paragraph") {
    const text = asNonEmptyString(raw.text);
    if (!text) return null;
    return { id, type: "paragraph", text };
  }

  if (type === "image") {
    const src = asNonEmptyString(raw.src);
    if (!src || !isValidMediaUrl(src)) return null;
    return {
      id,
      type: "image",
      src,
      caption: asOptionalString(raw.caption),
    };
  }

  if (type === "video") {
    const videoUrl = asOptionalString(raw.videoUrl);
    const embedUrl = asOptionalString(raw.embedUrl);

    if (!videoUrl && !embedUrl) return null;
    if (videoUrl && !isValidMediaUrl(videoUrl)) return null;
    if (embedUrl && (!isValidMediaUrl(embedUrl) || !isAllowedVideoEmbedUrl(embedUrl))) {
      return null;
    }

    return {
      id,
      type: "video",
      videoUrl,
      embedUrl,
      caption: asOptionalString(raw.caption),
    };
  }

  if (type === "audio") {
    const src = asNonEmptyString(raw.src);
    if (!src || !isValidMediaUrl(src)) return null;
    return {
      id,
      type: "audio",
      src,
      caption: asOptionalString(raw.caption),
    };
  }

  if (type === "quote") {
    const text = asNonEmptyString(raw.text);
    if (!text) return null;
    return {
      id,
      type: "quote",
      text,
      author: asOptionalString(raw.author),
    };
  }

  if (type === "link") {
    const href = asNonEmptyString(raw.href);
    const label = asNonEmptyString(raw.label);
    if (!href || !label || !isValidMediaUrl(href)) return null;
    return { id, type: "link", href, label };
  }

  return null;
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
