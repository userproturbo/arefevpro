"use client";

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
          className="rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/80 hover:bg-black/70 disabled:opacity-40"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          className="rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/80 hover:bg-black/70 disabled:opacity-40"
        >
          Next
        </button>
      </div>
      <div className="flex items-center gap-2">
        <PhotoLikeButton photoId={photoId} initialCount={likesCount} initialLiked={likedByMe} size="sm" />
        <button
          type="button"
          onClick={onToggleComments}
          className="rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-xs font-semibold text-white/90 hover:bg-black/70"
        >
          💬 Comments
        </button>
      </div>
    </div>
  );
}
