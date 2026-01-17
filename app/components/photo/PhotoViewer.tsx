"use client";

import { useRouter } from "next/navigation";
import PhotoLikeButton from "./PhotoLikeButton";

type PhotoItem = {
  id: number;
  url: string;
};

type Props = {
  slug: string;
  photos: PhotoItem[];
  activeId: number;
  likesCount: number;
  likedByMe: boolean;
};

export default function PhotoViewer({
  slug,
  photos,
  activeId,
  likesCount,
  likedByMe,
}: Props) {
  const router = useRouter();
  const encodedSlug = encodeURIComponent(slug);
  const activePhoto = photos.find((photo) => photo.id === activeId) ?? null;

  if (!activePhoto) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-white/70">
        Photo not found.
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="relative flex flex-1 items-center justify-center px-6 py-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activePhoto.url}
          alt=""
          className="max-h-full max-w-full object-contain"
        />
        <PhotoLikeButton
          photoId={activeId}
          initialCount={likesCount}
          initialLiked={likedByMe}
          className="absolute right-6 top-6 z-10"
        />
      </div>

      <div className="border-t border-white/10 bg-black/30">
        <div className="flex gap-2 overflow-x-auto p-3">
          {photos.map((photo) => {
            const isActive = photo.id === activeId;
            return (
              <button
                key={photo.id}
                type="button"
                onClick={() => {
                  if (isActive) return;
                  router.replace(`/photo/${encodedSlug}/${photo.id}`, {
                    scroll: false,
                  });
                }}
                className="shrink-0"
                aria-pressed={isActive}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt=""
                  loading="lazy"
                  className={`h-16 w-16 object-cover transition ${
                    isActive
                      ? "ring-2 ring-emerald-400"
                      : "opacity-70 hover:opacity-100"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
