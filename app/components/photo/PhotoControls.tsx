"use client";

import Image from "next/image";
import { photoStore, usePhotoStore } from "./photoStore";

type PhotoControlsProps = {
  photoId: number;
  onBackToGrid: () => void;
  onToggleComments: () => void;
};

export default function PhotoControls({ photoId, onBackToGrid, onToggleComments }: PhotoControlsProps) {
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
    <div className="pointer-events-none absolute inset-0 z-30">
      <div className="absolute left-6 top-20 flex flex-col gap-6">
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
    </div>
  );
}
