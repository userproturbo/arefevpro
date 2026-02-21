import type { BlogVideoBlock } from "@/lib/blogBlocks";
import { isAllowedVideoEmbedUrl } from "@/lib/blogBlocks";
import { transformYoutubeUrlToEmbed } from "@/lib/youtube";
import type { BlogAlign, BlogVariant } from "@/types/blogBlocks";

type Props = {
  block: BlogVideoBlock;
  variant: BlogVariant;
  align: BlogAlign;
};

function toSafeEmbedUrl(rawUrl: string): string | null {
  const youtube = transformYoutubeUrlToEmbed(rawUrl);
  if (youtube) return youtube;

  if (!isAllowedVideoEmbedUrl(rawUrl)) return null;

  try {
    const url = new URL(rawUrl);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "vimeo.com") {
      const videoId = url.pathname.split("/").find((part) => /^\d+$/.test(part));
      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
      return null;
    }

    if (host.endsWith("vimeo.com") || host.endsWith("youtube.com") || host === "youtu.be") {
      return rawUrl;
    }
  } catch {
    return null;
  }

  return null;
}

export default function VideoBlock({ block, variant }: Props) {
  const embedSource = block.data.embedUrl ? toSafeEmbedUrl(block.data.embedUrl) : null;
  const videoSource = block.data.videoUrl ?? null;

  if (!embedSource && !videoSource) {
    return null;
  }

  const isHero = variant === "hero";
  const frameClass = isHero
    ? "relative overflow-hidden rounded-2xl border border-cyan-300/25 bg-black/80 shadow-[0_0_0_1px_rgba(125,211,252,0.14),0_38px_72px_-44px_rgba(14,116,144,0.62)]"
    : "relative overflow-hidden rounded-2xl border border-cyan-300/20 bg-black/70 shadow-[0_0_0_1px_rgba(125,211,252,0.1),0_30px_60px_-40px_rgba(14,116,144,0.5)]";

  const figureClass = isHero ? "mt-8 mb-12 space-y-3" : "my-8 space-y-3";

  return (
    <figure className={figureClass}>
      <div className={frameClass}>
        <div className="relative aspect-video">
          {embedSource ? (
            <iframe
              src={embedSource}
              title={block.data.caption || "Embedded video"}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <video controls className="h-full w-full" preload="metadata">
              {videoSource ? <source src={videoSource} /> : null}
              Ваш браузер не поддерживает воспроизведение видео.
            </video>
          )}
          {isHero ? (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          ) : null}
        </div>
      </div>
      {block.data.caption ? (
        <figcaption className="text-center text-xs uppercase tracking-[0.1em] text-white/45">
          {block.data.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
