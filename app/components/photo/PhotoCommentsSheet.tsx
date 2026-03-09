"use client";

import PhotoComments from "@/app/components/comments/PhotoComments";

type PhotoCommentsSheetProps = {
  open: boolean;
  photoId: number;
  onClose: () => void;
  onCountChange?: (count: number) => void;
};

export default function PhotoCommentsSheet({ open, photoId, onClose, onCountChange }: PhotoCommentsSheetProps) {
  return (
    <div
      onClick={onClose}
      className={[
        "absolute inset-0 z-40 flex items-center justify-center bg-[rgba(0,0,0,0.55)] backdrop-blur-sm transition-opacity duration-200",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      ].join(" ")}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-[90%] max-w-[600px] overflow-hidden rounded-2xl border border-white/20 bg-[rgba(15,18,24,0.72)] shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b border-white/15 px-4 py-3">
          <p className="text-sm font-medium text-white">Comments</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/80"
          >
            Close
          </button>
        </div>
        <div className="max-h-[72vh] overflow-y-auto p-4">
          <PhotoComments photoId={photoId} onCountChange={onCountChange} />
        </div>
      </div>
    </div>
  );
}
