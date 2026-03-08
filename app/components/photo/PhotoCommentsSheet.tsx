"use client";

import PhotoComments from "@/app/components/comments/PhotoComments";

type PhotoCommentsSheetProps = {
  open: boolean;
  photoId: number;
  isMobile: boolean;
  onClose: () => void;
};

export default function PhotoCommentsSheet({ open, photoId, isMobile, onClose }: PhotoCommentsSheetProps) {
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close comments overlay"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/70"
      />

      {!isMobile ? (
        <div className="fixed inset-0 z-50 hidden items-center justify-center p-6 md:flex">
          <div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-[#0f1218]/95 p-4 shadow-2xl backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-white">Comments</p>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/80"
              >
                Close
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto pr-1">
              <PhotoComments photoId={photoId} />
            </div>
          </div>
        </div>
      ) : null}

      {isMobile ? (
        <div className="fixed inset-x-0 bottom-0 z-50 max-h-[72vh] rounded-t-2xl border border-white/15 bg-[#0f1218] p-4 md:hidden">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-white">Comments</p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/80"
            >
              Close
            </button>
          </div>
          <div className="max-h-[58vh] overflow-y-auto pr-1">
            <PhotoComments photoId={photoId} />
          </div>
        </div>
      ) : null}
    </>
  );
}
