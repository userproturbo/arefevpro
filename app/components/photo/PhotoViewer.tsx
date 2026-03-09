"use client";

import NextImage from "next/image";
import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import PhotoViewerControls from "./PhotoViewerControls";
import { usePhotoSwipe } from "./usePhotoSwipe";

type PhotoItem = {
  id: number;
  url: string;
};

type Props = {
  photos: PhotoItem[];
  activeId: number;
  likesCount: number;
  likedByMe: boolean;
  onClose: () => void;
  onNavigate: (photoId: number) => void;
  onOpenComments?: () => void;
  showOverlayLike?: boolean;
  showEdgeNav?: boolean;
  showCloseButton?: boolean;
};

export default function PhotoViewer({
  photos,
  activeId,
  likesCount,
  likedByMe,
  onClose,
  onNavigate,
  onOpenComments,
  showOverlayLike = true,
  showEdgeNav = false,
  showCloseButton = false,
}: Props) {
  const activePhoto = photos.find((photo) => photo.id === activeId) ?? null;
  const activeIndex = useMemo(
    () => photos.findIndex((photo) => photo.id === activeId),
    [photos, activeId]
  );
  const prevPhoto = activeIndex > 0 ? photos[activeIndex - 1] : null;
  const nextPhoto =
    activeIndex >= 0 && activeIndex < photos.length - 1
      ? photos[activeIndex + 1]
      : null;

  useEffect(() => {
    if (!nextPhoto) return;
    const image = new window.Image();
    image.src = nextPhoto.url;
  }, [nextPhoto]);

  useEffect(() => {
    const isEditableElement = (element: Element | null) => {
      if (!element) return false;
      const tag = element.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return true;
      return (element as HTMLElement).isContentEditable;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableElement(document.activeElement)) return;

      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "ArrowLeft" && prevPhoto) {
        event.preventDefault();
        onNavigate(prevPhoto.id);
      }

      if (event.key === "ArrowRight" && nextPhoto) {
        event.preventDefault();
        onNavigate(nextPhoto.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextPhoto, onClose, onNavigate, prevPhoto]);

  const openPrev = () => {
    if (!prevPhoto) return;
    onNavigate(prevPhoto.id);
  };

  const openNext = () => {
    if (!nextPhoto) return;
    onNavigate(nextPhoto.id);
  };

  const swipe = usePhotoSwipe({
    onSwipeNext: openNext,
    onSwipePrev: openPrev,
    onSwipeUp: () => onOpenComments?.(),
    onSwipeDown: onClose,
  });

  if (!activePhoto) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-white/70">
        Photo not found.
      </div>
    );
  }

  return (
    <div className="flex h-full w-full min-h-0 items-center justify-center pt-12 pb-10">
      <motion.div
        key={activePhoto.id}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex h-full w-full items-center justify-center overflow-hidden"
      >
        <div
          className="relative flex h-full w-full touch-pan-y select-none items-center justify-center"
          onClick={swipe.onDoubleTap}
          onTouchStart={swipe.onTouchStart}
          onTouchMove={swipe.onTouchMove}
          onTouchEnd={swipe.onTouchEnd}
          style={{ transform: `scale(${swipe.zoom})`, transformOrigin: "center center", transition: "transform 180ms ease-out" }}
        >
          <NextImage
            src={activePhoto.url}
            alt=""
            width={1800}
            height={1200}
            priority
            className="block h-auto max-h-full max-w-full object-contain"
          />
        </div>
        {showOverlayLike || showEdgeNav || showCloseButton || onOpenComments ? (
          <PhotoViewerControls
            photoId={activeId}
            likesCount={likesCount}
            likedByMe={likedByMe}
            hasPrev={Boolean(prevPhoto)}
            hasNext={Boolean(nextPhoto)}
            onPrev={openPrev}
            onNext={openNext}
            showGridButton={showCloseButton}
            showEdgeNav={showEdgeNav}
            onGridClick={onClose}
            onToggleComments={() => onOpenComments?.()}
          />
        ) : null}
      </motion.div>
    </div>
  );
}
