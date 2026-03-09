"use client";

import NextImage from "next/image";
import PhotoLikeButton from "./PhotoLikeButton";

type PhotoViewerControlsProps = {
  photoId: number;
  likesCount: number;
  likedByMe: boolean;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToggleComments: () => void;
};

export default function PhotoViewerControls({
  photoId,
  likesCount,
  likedByMe,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onToggleComments,
}: PhotoViewerControlsProps) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-4 md:px-0">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={!hasPrev}
          aria-label="Previous photo"
          className="inline-flex h-9 w-9 items-center justify-center bg-transparent text-white opacity-70 transition hover:opacity-100 disabled:opacity-30"
        >
          <NextImage src="/icons/ArrowLeftBold.svg" alt="" width={20} height={20} className="h-5 w-5 brightness-0 invert" />
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          aria-label="Next photo"
          className="inline-flex h-9 w-9 items-center justify-center bg-transparent text-white opacity-70 transition hover:opacity-100 disabled:opacity-30"
        >
          <NextImage src="/icons/ArrowRightBold.svg" alt="" width={20} height={20} className="h-5 w-5 brightness-0 invert" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <PhotoLikeButton photoId={photoId} initialCount={likesCount} initialLiked={likedByMe} size="sm" />
        <button
          type="button"
          onClick={onToggleComments}
          aria-label="Toggle comments"
          className="inline-flex h-9 w-9 items-center justify-center bg-transparent text-white opacity-70 transition hover:opacity-100"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5 fill-none stroke-current"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 14a4 4 0 0 1-4 4H9l-5 4v-4a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
