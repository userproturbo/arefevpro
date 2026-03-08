"use client";

import { useMemo, useState } from "react";

type UsePhotoViewerOptions = {
  photoIds: number[];
  initialPhotoId?: number | null;
  onPhotoChange?: (photoId: number | null) => void;
};

export function usePhotoViewer({ photoIds, initialPhotoId = null, onPhotoChange }: UsePhotoViewerOptions) {
  const [activePhotoId, setActivePhotoId] = useState<number | null>(initialPhotoId);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const activeIndex = useMemo(() => {
    if (!activePhotoId) return -1;
    return photoIds.findIndex((photoId) => photoId === activePhotoId);
  }, [activePhotoId, photoIds]);

  const prevPhotoId = activeIndex > 0 ? photoIds[activeIndex - 1] : null;
  const nextPhotoId =
    activeIndex >= 0 && activeIndex < photoIds.length - 1
      ? photoIds[activeIndex + 1]
      : null;

  const setPhoto = (photoId: number | null) => {
    setActivePhotoId(photoId);
    if (!photoId) {
      setCommentsOpen(false);
    }
    onPhotoChange?.(photoId);
  };

  const openPhoto = (photoId: number) => {
    setCommentsOpen(false);
    setPhoto(photoId);
  };

  const closePhoto = () => setPhoto(null);

  const openPrev = () => {
    if (prevPhotoId) openPhoto(prevPhotoId);
  };

  const openNext = () => {
    if (nextPhotoId) openPhoto(nextPhotoId);
  };

  return {
    activePhotoId,
    commentsOpen,
    setCommentsOpen,
    activeIndex,
    prevPhotoId,
    nextPhotoId,
    openPhoto,
    closePhoto,
    openPrev,
    openNext,
  };
}
