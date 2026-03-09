"use client";

import Image from "next/image";
import PhotoLikeButton from "./PhotoLikeButton";
import { photoLikesStore } from "./photoLikesStore";

type PhotoViewerControlsProps = {
  photoId: number;
  hasPrev: boolean;
  hasNext: boolean;
  showGridButton?: boolean;
  showEdgeNav?: boolean;
  onPrev: () => void;
  onNext: () => void;
  onGridClick?: () => void;
  onToggleComments: () => void;
};

export default function PhotoViewerControls({
  photoId,
  hasPrev,
  hasNext,
  showGridButton = true,
  showEdgeNav = true,
  onPrev,
  onNext,
  onGridClick,
  onToggleComments,
}: PhotoViewerControlsProps) {
  const { likedByMe, likesCount } = photoLikesStore.usePhoto(photoId);

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      <div className="absolute left-6 top-20 flex flex-col gap-6">
        {showGridButton ? (
          <button
            type="button"
            onClick={onGridClick}
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
        ) : null}

        <div className="flex items-center gap-2 pointer-events-auto">
          <PhotoLikeButton
            photoId={photoId}
            initialCount={likesCount}
            initialLiked={likedByMe}
            iconOnly
            iconSrc="/icons/Fire.svg"
            iconAlt="like"
            className="cursor-pointer brightness-0 invert opacity-80 hover:opacity-100"
          />
          {likesCount > 0 ? (
            <span className="text-xs text-white/70 min-w-[18px] transition-all duration-200">
              {likesCount}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onToggleComments}
          aria-label="Open comments"
          className="pointer-events-auto h-7 w-7 cursor-pointer"
        >
          <Image
            src="/icons/CommentAlt.svg"
            alt="comments"
            width={28}
            height={28}
            className="w-7 h-7 brightness-0 invert opacity-80 hover:opacity-100 transition"
          />
        </button>
      </div>

      {showEdgeNav ? (
        <>
          <button
            type="button"
            onClick={onPrev}
            disabled={!hasPrev}
            aria-label="Previous photo"
            className="pointer-events-auto absolute left-10 top-1/2 -translate-y-1/2 opacity-80 transition hover:opacity-100 disabled:opacity-30"
          >
            <Image src="/icons/ArrowLeftBold.svg" alt="" width={28} height={28} className="h-7 w-7 brightness-0 invert" />
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!hasNext}
            aria-label="Next photo"
            className="pointer-events-auto absolute right-10 top-1/2 -translate-y-1/2 opacity-80 transition hover:opacity-100 disabled:opacity-30"
          >
            <Image src="/icons/ArrowRightBold.svg" alt="" width={28} height={28} className="h-7 w-7 brightness-0 invert" />
          </button>
        </>
      ) : null}
    </div>
  );
}
