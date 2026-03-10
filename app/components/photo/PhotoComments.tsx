"use client";

import { useEffect, useRef, useState, type TouchEvent } from "react";
import BasePhotoComments from "@/app/components/comments/PhotoComments";
import { photoStore, usePhotoStore } from "./photoStore";

type PhotoCommentsProps = {
  open: boolean;
  photoId: number;
  onClose: () => void;
};

export default function PhotoComments({ open, photoId, onClose }: PhotoCommentsProps) {
  const commentsCount = usePhotoStore((state) => state.photos[photoId]?.commentsCount ?? 0);
  const [isMobile, setIsMobile] = useState(false);
  const [sheetDragY, setSheetDragY] = useState(0);
  const [sheetVisible, setSheetVisible] = useState(false);
  const sheetStartY = useRef(0);

  const handleClose = () => {
    setSheetDragY(0);
    setSheetVisible(false);
    onClose();
  };

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

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767.98px)");
    const update = () => setIsMobile(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!open) return;

    const rafId = window.requestAnimationFrame(() => setSheetVisible(true));
    return () => window.cancelAnimationFrame(rafId);
  }, [open]);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    sheetStartY.current = touch.clientY;
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    const deltaY = touch.clientY - sheetStartY.current;
    if (deltaY > 0) {
      setSheetDragY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (sheetDragY > 110) {
      handleClose();
      return;
    }
    setSheetDragY(0);
  };

  const onCountChange = (nextCount: number) => {
    const normalized = Number.isFinite(nextCount) ? Math.max(0, Math.floor(nextCount)) : 0;
    if (normalized > commentsCount) {
      for (let index = 0; index < normalized - commentsCount; index += 1) {
        photoStore.incrementComments(photoId);
      }
    }
  };

  if (!open) return null;

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50">
        <button
          type="button"
          aria-label="Close comments"
          onClick={handleClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        />

        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-white/10 bg-[#111] shadow-2xl transition-transform duration-200"
          style={{
            height: "75vh",
            maxHeight: "85vh",
            transform: `translate3d(0, ${sheetVisible ? sheetDragY : 520}px, 0)`,
          }}
        >
          <div className="mx-auto mb-4 mt-3 h-1.5 w-12 rounded-full bg-white/20" />
          <div className="mb-2 flex items-center justify-between px-4 pb-3">
            <p className="text-sm font-medium text-white">Комментарии {commentsCount}</p>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close comments"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/80"
            >
              ✕
            </button>
          </div>

          <div className="h-[calc(75vh-72px)] overflow-y-auto px-4 pb-4">
            <BasePhotoComments photoId={photoId} onCountChange={onCountChange} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClose}
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
            onClick={handleClose}
            className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/80 transition hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="max-h-[calc(70vh-64px)] overflow-y-auto">
          <BasePhotoComments photoId={photoId} onCountChange={onCountChange} />
        </div>
      </div>
    </div>
  );
}
