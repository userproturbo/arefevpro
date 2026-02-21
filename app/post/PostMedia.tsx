/* eslint-disable @next/next/no-img-element */
import { PostType } from "@prisma/client";
import { transformYoutubeUrlToEmbed } from "@/lib/youtube";
import type { MediaDTO } from "@/types/media";

type Props = {
  type: PostType;
  media: MediaDTO | null;
  title: string;
};

export default function PostMedia({ type, media, title }: Props) {
  const mediaUrl = media?.url?.trim() || "";

  if (!mediaUrl) {
    return null;
  }

  switch (type) {
    case PostType.PHOTO: {
      return (
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <img
            src={mediaUrl}
            alt={title}
            className="h-auto w-full object-cover"
            loading="lazy"
          />
        </div>
      );
    }
    case PostType.VIDEO: {
      const embedUrl = transformYoutubeUrlToEmbed(mediaUrl);
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
            preload="metadata"
          >
            <source src={mediaUrl} />
            Ваш браузер не поддерживает воспроизведение видео.
          </video>
        </div>
      );
    }
    case PostType.MUSIC: {
      return (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <audio controls className="w-full">
            <source src={mediaUrl} />
            Ваш браузер не поддерживает воспроизведение аудио.
          </audio>
        </div>
      );
    }
    default:
      return null;
  }
}
