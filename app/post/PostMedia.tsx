/* eslint-disable @next/next/no-img-element */
import { PostType } from "@prisma/client";
import { transformYoutubeUrlToEmbed } from "@/lib/youtube";

type Props = {
  type: PostType;
  mediaUrl: string | null;
  coverImage: string | null;
  title: string;
};

export default function PostMedia({ type, mediaUrl, coverImage, title }: Props) {
  const safeMedia = mediaUrl?.trim() || "";
  const safeCover = coverImage?.trim() || "";

  if (!safeMedia && !safeCover) {
    return null;
  }

  switch (type) {
    case PostType.PHOTO: {
      const src = safeMedia || safeCover;
      if (!src) return null;
      return (
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <img
            src={src}
            alt={title}
            className="h-auto w-full object-cover"
            loading="lazy"
          />
        </div>
      );
    }
    case PostType.VIDEO: {
      if (!safeMedia) return null;
      const embedUrl = transformYoutubeUrlToEmbed(safeMedia);
      if (embedUrl) {
        return (
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
            <div className="relative aspect-video">
              <iframe
                src={embedUrl}
                title={title}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        );
      }

      return (
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black">
          <video
            controls
            className="w-full"
            poster={safeCover || undefined}
            preload="metadata"
          >
            <source src={safeMedia} />
            Ваш браузер не поддерживает воспроизведение видео.
          </video>
        </div>
      );
    }
    case PostType.MUSIC: {
      if (!safeMedia) return null;
      return (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <audio controls className="w-full">
            <source src={safeMedia} />
            Ваш браузер не поддерживает воспроизведение аудио.
          </audio>
        </div>
      );
    }
    default:
      return null;
  }
}
