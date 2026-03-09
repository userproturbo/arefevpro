"use client";

import { useEffect } from "react";
import BasePhotoComments from "@/app/components/comments/PhotoComments";
import { photoStore, usePhotoStore } from "./photoStore";

type PhotoCommentsProps = {
  open: boolean;
  photoId: number;
  onClose: () => void;
};

export default function PhotoComments({ open, photoId, onClose }: PhotoCommentsProps) {
  const commentsCount = usePhotoStore((state) => state.photos[photoId]?.commentsCount ?? 0);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-[520px] max-h-[70vh] overflow-y-auto rounded-2xl bg-neutral-900 p-6"
      >
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <p className="text-sm font-medium text-white">Comments</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/80 transition hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="max-h-[calc(70vh-64px)] overflow-y-auto">
          <BasePhotoComments
            photoId={photoId}
            onCountChange={(nextCount) => {
              const normalized = Number.isFinite(nextCount) ? Math.max(0, Math.floor(nextCount)) : 0;
              if (normalized > commentsCount) {
                for (let index = 0; index < normalized - commentsCount; index += 1) {
                  photoStore.incrementComments(photoId);
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
