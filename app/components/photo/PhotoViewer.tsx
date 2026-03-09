"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import PhotoComments from "./PhotoComments";
import PhotoControls from "./PhotoControls";
import { usePhotoStore } from "./photoStore";

type PhotoViewerProps = {
  onClose: () => void;
};

export default function PhotoViewer({ onClose }: PhotoViewerProps) {
  const activePhotoId = usePhotoStore((state) => state.activePhotoId);
  const order = usePhotoStore((state) => state.order);
  const photos = usePhotoStore((state) => state.photos);
  const setActivePhoto = usePhotoStore((state) => state.setActivePhoto);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const activeIndex = useMemo(() => {
    if (!activePhotoId) return -1;
    return order.findIndex((id) => id === activePhotoId);
  }, [activePhotoId, order]);

  const currentPhoto = activePhotoId ? photos[activePhotoId] : null;
  const prevPhotoId = activeIndex > 0 ? order[activeIndex - 1] : null;
  const nextPhotoId = activeIndex >= 0 && activeIndex < order.length - 1 ? order[activeIndex + 1] : null;
  const nextPhoto = nextPhotoId ? photos[nextPhotoId] : null;

  useEffect(() => {
    if (!nextPhoto) return;

    const img = new window.Image();
    img.src = nextPhoto.url;
  }, [nextPhoto]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setCommentsOpen(false);
        setActivePhoto(null);
        onClose();
      }

      if (event.key === "ArrowLeft" && prevPhotoId) {
        event.preventDefault();
        setActivePhoto(prevPhotoId);
      }

      if (event.key === "ArrowRight" && nextPhotoId) {
        event.preventDefault();
        setActivePhoto(nextPhotoId);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [nextPhotoId, onClose, prevPhotoId, setActivePhoto]);

  if (!currentPhoto) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-white/70">
        Photo not found.
      </div>
    );
  }

  return (
    <div className="relative flex h-[92vh] min-h-[420px] w-full items-center justify-center overflow-hidden pt-12 pb-10">
      <div className="relative flex h-full w-full items-center justify-center">
        <Image
          src={currentPhoto.url}
          alt=""
          width={1800}
          height={1200}
          priority
          className="block h-auto max-h-full max-w-full object-contain"
        />
      </div>

      <PhotoControls
        photoId={currentPhoto.id}
        onBackToGrid={() => {
          setCommentsOpen(false);
          setActivePhoto(null);
          onClose();
        }}
        onToggleComments={() => setCommentsOpen((prev) => !prev)}
      />

      <button
        type="button"
        onClick={() => prevPhotoId && setActivePhoto(prevPhotoId)}
        disabled={!prevPhotoId}
        aria-label="Previous photo"
        className="pointer-events-auto absolute left-10 top-1/2 z-30 -translate-y-1/2 opacity-80 transition hover:opacity-100 disabled:opacity-30"
      >
        <Image src="/icons/ArrowLeftBold.svg" alt="" width={28} height={28} className="h-7 w-7 brightness-0 invert" />
      </button>
      <button
        type="button"
        onClick={() => nextPhotoId && setActivePhoto(nextPhotoId)}
        disabled={!nextPhotoId}
        aria-label="Next photo"
        className="pointer-events-auto absolute right-10 top-1/2 z-30 -translate-y-1/2 opacity-80 transition hover:opacity-100 disabled:opacity-30"
      >
        <Image src="/icons/ArrowRightBold.svg" alt="" width={28} height={28} className="h-7 w-7 brightness-0 invert" />
      </button>

      <PhotoComments open={commentsOpen} photoId={currentPhoto.id} onClose={() => setCommentsOpen(false)} />
    </div>
  );
}
