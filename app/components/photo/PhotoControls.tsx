"use client";

import Image from "next/image";
import { photoStore, usePhotoStore } from "./photoStore";

type PhotoControlsProps = {
  photoId: number;
  onBackToGrid: () => void;
  onToggleComments: () => void;
  className?: string;
};

export default function PhotoControls({
  photoId,
  onBackToGrid,
  onToggleComments,
  className,
}: PhotoControlsProps) {
  const photo = photoStore.usePhoto(photoId);

  const onLike = async () => {
    const previous = usePhotoStore.getState().photos[photoId] ?? photo;
    photoStore.toggleLike(photoId);

    try {
      const response = await fetch(`/api/photos/${photoId}/like`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }
    } catch {
      photoStore.setPhoto(photoId, previous);
    }
  };

  return (
    <div className={["pointer-events-none absolute inset-0 z-30", className ?? ""].join(" ")}>
      <div className="absolute left-6 top-20 hidden flex-col gap-6 md:flex">
        <button
          type="button"
          onClick={onBackToGrid}
          aria-label="Back to grid"
          className="pointer-events-auto h-7 w-7 cursor-pointer"
        >
          <Image
            src="/icons/Grid.svg"
            alt="grid"
            width={28}
            height={28}
            className="w-7 h-7 brightness-0 invert opacity-80 hover:opacity-100 transition"
          />
        </button>

        <button
          type="button"
          onClick={onLike}
          aria-label={photo.likedByMe ? "Unlike photo" : "Like photo"}
          className="pointer-events-auto inline-flex items-center gap-2 cursor-pointer"
        >
          <Image
            src="/icons/Fire.svg"
            alt="like"
            width={28}
            height={28}
            className={[
              "w-7 h-7 brightness-0 invert transition active:scale-90",
              photo.likedByMe
                ? "scale-110 opacity-100 drop-shadow-[0_0_8px_rgba(255,120,0,0.6)]"
                : "opacity-70 hover:opacity-100",
            ].join(" ")}
          />
          <span className="min-w-[18px] text-left text-xs text-white/70 transition-all duration-200">
            {photo.likesCount > 0 ? photo.likesCount : ""}
          </span>
        </button>

        <button
          type="button"
          onClick={onToggleComments}
          aria-label="Open comments"
          className="pointer-events-auto inline-flex items-center gap-2 cursor-pointer"
        >
          <Image
            src="/icons/CommentAlt.svg"
            alt="comments"
            width={28}
            height={28}
            className="w-7 h-7 brightness-0 invert opacity-80 hover:opacity-100 transition"
          />
          {photo.commentsCount > 0 ? (
            <span className="text-xs text-white/70">{photo.commentsCount}</span>
          ) : null}
        </button>
      </div>

      <div className="pointer-events-auto md:hidden">
        <div className="absolute left-4 top-4">
          <button
            type="button"
            onClick={onBackToGrid}
            aria-label="Back to grid"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 backdrop-blur transition-all duration-200"
          >
            <Image
              src="/icons/Grid.svg"
              alt="grid"
              width={24}
              height={24}
              className="h-6 w-6 brightness-0 invert opacity-90"
            />
          </button>
        </div>

        <div className="absolute right-4 top-4">
          <button
            type="button"
            onClick={onBackToGrid}
            aria-label="Close viewer"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white/90 backdrop-blur transition-all duration-200"
          >
            ✕
          </button>
        </div>

        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-8 pb-[env(safe-area-inset-bottom)]">
          <button
            type="button"
            onClick={onLike}
            aria-label={photo.likedByMe ? "Unlike photo" : "Like photo"}
            className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-black/60 px-3 text-white backdrop-blur transition-all duration-200"
          >
            <Image
              src="/icons/Fire.svg"
              alt="like"
              width={22}
              height={22}
              className={[
                "h-5 w-5 brightness-0 invert transition-all duration-200",
                photo.likedByMe
                  ? "scale-110 opacity-100 drop-shadow-[0_0_8px_rgba(255,120,0,0.6)]"
                  : "opacity-80",
              ].join(" ")}
            />
            {photo.likesCount > 0 ? <span className="text-xs">{photo.likesCount}</span> : null}
          </button>

          <button
            type="button"
            onClick={onToggleComments}
            aria-label="Open comments"
            className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-black/60 px-3 text-white backdrop-blur transition-all duration-200"
          >
            <Image
              src="/icons/CommentAlt.svg"
              alt="comments"
              width={22}
              height={22}
              className="h-5 w-5 brightness-0 invert opacity-90"
            />
            {photo.commentsCount > 0 ? <span className="text-xs">{photo.commentsCount}</span> : null}
          </button>
        </div>
      </div>
    </div>
  );
}
