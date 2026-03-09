"use client";

import { useEffect } from "react";
import PhotoComments from "@/app/components/comments/PhotoComments";

type PhotoCommentsOverlayProps = {
  open: boolean;
  photoId: number;
  onClose: () => void;
  onCountChange?: (count: number) => void;
};

export default function PhotoCommentsOverlay({
  open,
  photoId,
  onClose,
  onCountChange,
}: PhotoCommentsOverlayProps) {
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

  if (!open) {
    return null;
  }

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
          <PhotoComments photoId={photoId} onCountChange={onCountChange} />
        </div>
      </div>
    </div>
  );
}
