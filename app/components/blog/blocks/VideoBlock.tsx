import type { BlogBlock } from "@/lib/blogBlocks";
import { isAllowedVideoEmbedUrl } from "@/lib/blogBlocks";
import { transformYoutubeUrlToEmbed } from "@/lib/youtube";

type VideoBlockData = Extract<BlogBlock, { type: "video" }>;

type Props = {
  block: VideoBlockData;
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

export default function VideoBlock({ block }: Props) {
  const embedSource = block.embedUrl ? toSafeEmbedUrl(block.embedUrl) : null;
  const videoSource = block.videoUrl ?? null;

  if (!embedSource && !videoSource) {
    return null;
  }

  return (
    <figure className="mx-auto max-w-4xl space-y-3">
      <div className="overflow-hidden rounded-2xl border border-cyan-300/20 bg-black/70 shadow-[0_0_0_1px_rgba(125,211,252,0.1),0_30px_60px_-40px_rgba(14,116,144,0.5)]">
        <div className="relative aspect-video">
          {embedSource ? (
            <iframe
              src={embedSource}
              title={block.caption || "Embedded video"}
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
        </div>
      </div>
      {block.caption ? (
        <figcaption className="text-center text-xs uppercase tracking-[0.1em] text-white/45">
          {block.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
