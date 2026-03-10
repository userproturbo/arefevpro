/* eslint-disable @next/next/no-img-element */
"use client";

import { motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";

import PhotoComments from "./PhotoComments";
import PhotoControls from "./PhotoControls";
import { usePhotoStore } from "./photoStore";

type PhotoViewerProps = {
  onClose: () => void;
};

const MIN_SCALE = 1;
const MAX_SCALE = 4;

type Translate = { x: number; y: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

type ViewerImageProps = {
  photoId: number;
  src: string;
  scale: number;
  translate: Translate;
  dragging: boolean;
  onMouseDown: (event: MouseEvent<HTMLImageElement>) => void;
};

function ViewerImage({
  photoId,
  src,
  scale,
  translate,
  dragging,
  onMouseDown,
}: ViewerImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const transform = imageLoaded
    ? `translate3d(${translate.x}px, ${translate.y}px, 0) scale(${scale})`
    : "none";

  return (
    <motion.img
      key={photoId}
      src={src}
      alt=""
      onLoad={() => setImageLoaded(true)}
      onMouseDown={onMouseDown}
      className="relative z-10 max-h-[90vh] max-w-[90vw] object-contain"
      style={{
        transform,
        opacity: imageLoaded ? 1 : 0,
        cursor: scale > 1 ? "grab" : "zoom-in",
        transition: dragging
          ? "none"
          : "transform .25s ease, opacity .25s ease",
      }}
    />
  );
}

export default function PhotoViewer({ onClose }: PhotoViewerProps) {
  const activePhotoId = usePhotoStore((s) => s.activePhotoId);
  const order = usePhotoStore((s) => s.order);
  const photos = usePhotoStore((s) => s.photos);
  const setActivePhoto = usePhotoStore((s) => s.setActivePhoto);

  const viewerRef = useRef<HTMLDivElement | null>(null);

  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState<Translate>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const dragStart = useRef<Translate>({ x: 0, y: 0 });

  const activeIndex = useMemo(() => {
    if (!activePhotoId) return -1;
    return order.findIndex((id) => id === activePhotoId);
  }, [activePhotoId, order]);

  const currentPhoto = activePhotoId ? photos[activePhotoId] : null;

  const prevPhotoId = activeIndex > 0 ? order[activeIndex - 1] : null;
  const nextPhotoId =
    activeIndex >= 0 && activeIndex < order.length - 1
      ? order[activeIndex + 1]
      : null;

  const closeViewer = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setActivePhoto(null);
    onClose();
  }, [onClose, setActivePhoto]);

  const nextPhoto = useCallback(() => {
    if (!nextPhotoId) return;
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setActivePhoto(nextPhotoId);
  }, [nextPhotoId, setActivePhoto]);

  const prevPhoto = useCallback(() => {
    if (!prevPhotoId) return;
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setActivePhoto(prevPhotoId);
  }, [prevPhotoId, setActivePhoto]);

  const updateScale = useCallback((delta: number) => {
    setScale((prev) => clamp(prev + delta, MIN_SCALE, MAX_SCALE));
  }, []);

  const computeBounds = useCallback(
    (nextScale: number) => {
      const rect = viewerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };

      const maxX = ((rect.width * nextScale) - rect.width) / 2;
      const maxY = ((rect.height * nextScale) - rect.height) / 2;

      return { x: maxX, y: maxY };
    },
    []
  );

  const clampTranslate = useCallback(
    (next: Translate, nextScale: number) => {
      if (nextScale <= 1) return { x: 0, y: 0 };

      const bounds = computeBounds(nextScale);

      return {
        x: clamp(next.x, -bounds.x, bounds.x),
        y: clamp(next.y, -bounds.y, bounds.y),
      };
    },
    [computeBounds]
  );

  const onMouseDown = (e: MouseEvent<HTMLImageElement>) => {
    if (scale <= 1) return;

    setDragging(true);

    dragStart.current = {
      x: e.clientX - translate.x,
      y: e.clientY - translate.y,
    };
  };

  const onMouseMove = useCallback(
    (e: globalThis.MouseEvent) => {
      if (!dragging) return;

      const next = {
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      };

      setTranslate(clampTranslate(next, scale));
    },
    [dragging, scale, clampTranslate]
  );

  const onMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "ArrowLeft") prevPhoto();
      if (e.key === "+") updateScale(0.2);
      if (e.key === "-") updateScale(-0.2);
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, [closeViewer, nextPhoto, prevPhoto, updateScale]);

  if (!currentPhoto) return null;

  return (
    <div
      ref={viewerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
    >
      {/* background blur */}
      <img
        src={currentPhoto.url}
        alt=""
        className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-30"
      />

      {/* main image */}
      <ViewerImage
        key={currentPhoto.id}
        photoId={currentPhoto.id}
        src={currentPhoto.url}
        onMouseDown={onMouseDown}
        scale={scale}
        translate={translate}
        dragging={dragging}
      />

      <PhotoControls
        photoId={currentPhoto.id}
        currentIndex={activeIndex + 1}
        totalPhotos={order.length}
        onBackToGrid={closeViewer}
        onToggleComments={() => {}}
        commentsOpen={false}
      />

      {prevPhotoId && (
        <button
          onClick={prevPhoto}
          className="absolute left-10 top-1/2 -translate-y-1/2 text-white"
        >
          ←
        </button>
      )}

      {nextPhotoId && (
        <button
          onClick={nextPhoto}
          className="absolute right-10 top-1/2 -translate-y-1/2 text-white"
        >
          →
        </button>
      )}

      <PhotoComments
        open={false}
        photoId={currentPhoto.id}
        onClose={() => {}}
      />
    </div>
  );
}
