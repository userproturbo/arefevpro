import { parseBlogContent } from "@/lib/blogBlocks";

type PreviewPost = {
  title?: string | null;
  slug?: string | null;
  content?: unknown;
  text?: string | null;
  coverMedia?: { url: string } | null;
  coverImage?: string | null;
};

export type PostCoverPreview =
  | {
      kind: "image";
      src: string;
    }
  | {
      kind: "fallback";
      gradientClass: string;
    };

const FALLBACK_GRADIENTS = [
  "from-cyan-500/25 via-blue-500/15 to-slate-900",
  "from-emerald-500/20 via-cyan-500/10 to-slate-900",
  "from-amber-500/20 via-rose-500/10 to-slate-900",
  "from-indigo-500/20 via-cyan-500/10 to-slate-900",
] as const;

function toCleanString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function trimAndLimit(value: string, maxLength: number): string {
  const normalized = normalizeText(value);
  if (!normalized) return "";
  return normalized.length > maxLength
    ? `${normalized.slice(0, maxLength).trimEnd()}…`
    : normalized;
}

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function getFallbackGradient(seed: string): string {
  const index = hashString(seed) % FALLBACK_GRADIENTS.length;
  return FALLBACK_GRADIENTS[index];
}

function getYoutubeIdFromUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (host === "youtube.com" || host.endsWith(".youtube.com") || host === "m.youtube.com") {
      if (url.pathname.startsWith("/embed/")) {
        return url.pathname.split("/").filter(Boolean)[1] ?? null;
      }
      if (url.pathname.startsWith("/shorts/")) {
        return url.pathname.split("/").filter(Boolean)[1] ?? null;
      }
      const fromQuery = url.searchParams.get("v");
      if (fromQuery) return fromQuery;
    }

    return null;
  } catch {
    return null;
  }
}

function getVimeoIdFromUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (host !== "vimeo.com" && !host.endsWith(".vimeo.com")) {
      return null;
    }

    const candidate = url.pathname
      .split("/")
      .filter(Boolean)
      .find((part) => /^\d+$/.test(part));

    return candidate ?? null;
  } catch {
    return null;
  }
}

function getVideoThumbnail(rawUrl: string): string | null {
  const youtubeId = getYoutubeIdFromUrl(rawUrl);
  if (youtubeId) {
    return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
  }

  const vimeoId = getVimeoIdFromUrl(rawUrl);
  if (vimeoId) {
    return `https://vumbnail.com/${vimeoId}.jpg`;
  }

  return null;
}

export function getPostTitle(post: PreviewPost): string {
  const parsedContent = parseBlogContent(post.content);
  if (parsedContent?.length) {
    const heading = parsedContent.find(
      (block): block is Extract<(typeof parsedContent)[number], { type: "heading" }> =>
        block.type === "heading" &&
        block.data.level === 1 &&
        block.data.text.trim().length > 0
    );
    if (heading) {
      return heading.data.text.trim();
    }
  }

  const fallback = toCleanString(post.title);
  return fallback || "Untitled";
}

export function getPostExcerpt(post: PreviewPost, maxLength = 160): string {
  const parsedContent = parseBlogContent(post.content);
  if (parsedContent?.length) {
    const paragraph = parsedContent.find(
      (block): block is Extract<(typeof parsedContent)[number], { type: "paragraph" }> =>
        block.type === "paragraph" && block.data.text.trim().length > 0
    );
    if (paragraph) {
      return trimAndLimit(paragraph.data.text, maxLength);
    }
  }

  return trimAndLimit(toCleanString(post.text), maxLength);
}

export function getPostCover(post: PreviewPost): PostCoverPreview {
  const parsedContent = parseBlogContent(post.content);

  if (parsedContent?.length) {
    const image = parsedContent.find(
      (block): block is Extract<(typeof parsedContent)[number], { type: "image" }> =>
        block.type === "image" &&
        typeof block.data.src === "string" &&
        block.data.src.trim().length > 0
    );
    if (image) {
      return { kind: "image", src: blockSafeTrim(image.data.src) };
    }

    const video = parsedContent.find(
      (block): block is Extract<(typeof parsedContent)[number], { type: "video" }> =>
        block.type === "video"
    );

    if (video) {
      const embedThumb = video.data.embedUrl
        ? getVideoThumbnail(video.data.embedUrl.trim())
        : null;
      if (embedThumb) {
        return { kind: "image", src: embedThumb };
      }

      const urlThumb = video.data.videoUrl
        ? getVideoThumbnail(video.data.videoUrl.trim())
        : null;
      if (urlThumb) {
        return { kind: "image", src: urlThumb };
      }
    }
  }

  const mediaCover = toCleanString(post.coverMedia?.url);
  if (mediaCover) {
    return { kind: "image", src: mediaCover };
  }

  const legacyCover = toCleanString(post.coverImage);
  if (legacyCover) {
    return { kind: "image", src: legacyCover };
  }

  const seed = `${toCleanString(post.slug)}:${toCleanString(post.title)}`;
  return {
    kind: "fallback",
    gradientClass: getFallbackGradient(seed || "blog"),
  };
}

function blockSafeTrim(value: string): string {
  return value.trim();
}
