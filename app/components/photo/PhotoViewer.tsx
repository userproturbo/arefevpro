/* eslint-disable @next/next/no-img-element */
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type TouchEvent,
} from "react";

import PhotoComments from "./PhotoComments";
import PhotoControls from "./PhotoControls";
import { usePhotoStore } from "./photoStore";

type PhotoViewerProps = {
  onClose: () => void;
};

type Translate = {
  x: number;
  y: number;
};

type GestureMode = "none" | "swipe" | "pan" | "pinch";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const SWIPE_DISTANCE_THRESHOLD = 80;
const SWIPE_VELOCITY_THRESHOLD = 0.3;
const TAP_MAX_DISTANCE = 12;
const DOUBLE_TAP_DELAY = 260;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getDistance(touches: TouchList) {
  if (touches.length < 2) return 0;
  const [first, second] = [touches[0], touches[1]];
  if (!first || !second) return 0;
  return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
}

type ViewerImageProps = {
  photoId: number;
  src: string;
  scale: number;
  translate: Translate;
  swipeOffsetX: number;
  dragging: boolean;
  onMouseDown: (event: MouseEvent<HTMLDivElement>) => void;
  onDoubleClick: (event: MouseEvent<HTMLDivElement>) => void;
};

function ViewerImage({
  photoId,
  src,
  scale,
  translate,
  swipeOffsetX,
  dragging,
  onMouseDown,
  onDoubleClick,
}: ViewerImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const opacity = imageLoaded
    ? scale === 1
      ? Math.max(0.72, 1 - Math.abs(swipeOffsetX) / 420)
      : 1
    : 0;

  return (
    <motion.div
      key={photoId}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      className="relative z-10 flex max-h-[95vh] max-w-[95vw] items-center justify-center"
      style={{
        transform: imageLoaded
          ? `translate3d(${translate.x + swipeOffsetX}px, ${translate.y}px, 0) scale(${scale})`
          : "none",
        opacity,
        transition: dragging
          ? "none"
          : "transform 220ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease-out",
        willChange: imageLoaded ? "transform, opacity" : "opacity",
        cursor: scale > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in",
      }}
    >
      <img
        key={photoId}
        src={src}
        alt=""
        onLoad={() => setImageLoaded(true)}
        className="block max-h-[95vh] max-w-[95vw] object-contain select-none"
        decoding="async"
        draggable={false}
      />
    </motion.div>
  );
}

export default function PhotoViewer({ onClose }: PhotoViewerProps) {
  const activePhotoId = usePhotoStore((state) => state.activePhotoId);
  const order = usePhotoStore((state) => state.order);
  const photos = usePhotoStore((state) => state.photos);
  const setActivePhoto = usePhotoStore((state) => state.setActivePhoto);

  const viewerRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<Translate>({ x: 0, y: 0 });
  const gestureModeRef = useRef<GestureMode>("none");
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchLastYRef = useRef(0);
  const touchStartTimeRef = useRef(0);
  const pinchStartDistanceRef = useRef(0);
  const pinchStartScaleRef = useRef(1);
  const lastTapRef = useRef(0);

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState<Translate>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [swipeOffsetX, setSwipeOffsetX] = useState(0);

  const activeIndex = useMemo(() => {
    if (!activePhotoId) return -1;
    return order.findIndex((id) => id === activePhotoId);
  }, [activePhotoId, order]);

  const currentPhoto = activePhotoId ? photos[activePhotoId] : null;
  const prevPhotoId = activeIndex > 0 ? order[activeIndex - 1] : null;
  const nextPhotoId =
    activeIndex >= 0 && activeIndex < order.length - 1 ? order[activeIndex + 1] : null;

  const clampTranslate = useCallback(
    (next: Translate, nextScale: number) => {
      if (nextScale <= 1) return { x: 0, y: 0 };

      const rect = viewerRef.current?.getBoundingClientRect();
      if (!rect) return next;

      const maxOffsetX = Math.max(0, ((rect.width * nextScale) - rect.width) / 2);
      const maxOffsetY = Math.max(0, ((rect.height * nextScale) - rect.height) / 2);

      return {
        x: clamp(next.x, -maxOffsetX, maxOffsetX),
        y: clamp(next.y, -maxOffsetY, maxOffsetY),
      };
    },
    []
  );

  const resetView = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setSwipeOffsetX(0);
    setDragging(false);
    gestureModeRef.current = "none";
  }, []);

  const goToPhoto = useCallback(
    (photoId: number | null) => {
      if (!photoId) return;
      resetView();
      setCommentsOpen(false);
      setActivePhoto(photoId);
    },
    [resetView, setActivePhoto]
  );

  const closeViewer = useCallback(() => {
    resetView();
    setCommentsOpen(false);
    setActivePhoto(null);
    onClose();
  }, [onClose, resetView, setActivePhoto]);

  const nextPhoto = useCallback(() => {
    if (!nextPhotoId) return;
    goToPhoto(nextPhotoId);
  }, [goToPhoto, nextPhotoId]);

  const prevPhoto = useCallback(() => {
    if (!prevPhotoId) return;
    goToPhoto(prevPhotoId);
  }, [goToPhoto, prevPhotoId]);

  const updateScale = useCallback(
    (delta: number) => {
      setScale((prev) => {
        const next = clamp(prev + delta, MIN_SCALE, MAX_SCALE);
        setTranslate((current) => clampTranslate(current, next));
        return next;
      });
    },
    [clampTranslate]
  );

  const toggleZoomAtPoint = useCallback(
    (clientX: number, clientY: number) => {
      const rect = viewerRef.current?.getBoundingClientRect();
      if (!rect) return;

      if (scale > 1) {
        resetView();
        return;
      }

      const nextScale = 2;
      const offsetX = clientX - rect.left - rect.width / 2;
      const offsetY = clientY - rect.top - rect.height / 2;
      const nextTranslate = clampTranslate(
        {
          x: -offsetX,
          y: -offsetY,
        },
        nextScale
      );

      setScale(nextScale);
      setTranslate(nextTranslate);
      setSwipeOffsetX(0);
    },
    [clampTranslate, resetView, scale]
  );

  const onMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (scale <= 1) return;

    event.preventDefault();
    setDragging(true);
    gestureModeRef.current = "pan";
    dragStartRef.current = {
      x: event.clientX - translate.x,
      y: event.clientY - translate.y,
    };
  };

  const onMouseMove = useCallback(
    (event: globalThis.MouseEvent) => {
      if (!dragging || gestureModeRef.current !== "pan" || scale <= 1) return;

      const next = {
        x: event.clientX - dragStartRef.current.x,
        y: event.clientY - dragStartRef.current.y,
      };

      setTranslate(clampTranslate(next, scale));
    },
    [clampTranslate, dragging, scale]
  );

  const onMouseUp = useCallback(() => {
    setDragging(false);
    if (gestureModeRef.current === "pan") {
      gestureModeRef.current = "none";
    }
  }, []);

  const onDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
    toggleZoomAtPoint(event.clientX, event.clientY);
  };

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (commentsOpen) return;

    if (event.touches.length === 2) {
      gestureModeRef.current = "pinch";
      pinchStartDistanceRef.current = getDistance(event.touches);
      pinchStartScaleRef.current = scale;
      return;
    }

    const touch = event.touches[0];
    if (!touch) return;

    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    touchLastYRef.current = touch.clientY;
    touchStartTimeRef.current = Date.now();

    if (scale > 1) {
      gestureModeRef.current = "pan";
      setDragging(true);
      dragStartRef.current = {
        x: touch.clientX - translate.x,
        y: touch.clientY - translate.y,
      };
      return;
    }

    gestureModeRef.current = "swipe";
    setSwipeOffsetX(0);
  };

  const onTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (commentsOpen) return;

    if (event.touches.length === 2 && gestureModeRef.current === "pinch") {
      const nextDistance = getDistance(event.touches);
      if (!pinchStartDistanceRef.current) return;

      const nextScale = clamp(
        pinchStartScaleRef.current * (nextDistance / pinchStartDistanceRef.current),
        MIN_SCALE,
        MAX_SCALE
      );

      setScale(nextScale);
      setTranslate((current) => clampTranslate(current, nextScale));
      return;
    }

    const touch = event.touches[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartXRef.current;
    const deltaY = touch.clientY - touchStartYRef.current;
    touchLastYRef.current = touch.clientY;

    if (gestureModeRef.current === "pan" && scale > 1) {
      const next = {
        x: touch.clientX - dragStartRef.current.x,
        y: touch.clientY - dragStartRef.current.y,
      };
      setTranslate(clampTranslate(next, scale));
      return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setSwipeOffsetX(deltaX);
    }
  };

  const onTouchEnd = () => {
    if (commentsOpen) return;

    if (gestureModeRef.current === "pinch") {
      gestureModeRef.current = "none";
      setDragging(false);
      return;
    }

    const deltaX = swipeOffsetX;
    const duration = Math.max(Date.now() - touchStartTimeRef.current, 1);
    const velocity = deltaX / duration;
    const movedFarEnough =
      Math.abs(deltaX) > SWIPE_DISTANCE_THRESHOLD || Math.abs(velocity) > SWIPE_VELOCITY_THRESHOLD;

    if (gestureModeRef.current === "pan" && scale > 1) {
      setDragging(false);
      gestureModeRef.current = "none";
      return;
    }

    if (gestureModeRef.current === "swipe" && movedFarEnough) {
      if (deltaX < 0) {
        nextPhoto();
      } else {
        prevPhoto();
      }
      return;
    }

    if (
      gestureModeRef.current === "swipe" &&
      Math.abs(deltaX) < TAP_MAX_DISTANCE &&
      Math.abs(touchLastYRef.current - touchStartYRef.current) < TAP_MAX_DISTANCE
    ) {
      const now = Date.now();
      if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
        toggleZoomAtPoint(touchStartXRef.current, touchStartYRef.current);
        lastTapRef.current = 0;
      } else {
        lastTapRef.current = now;
      }
    }

    setSwipeOffsetX(0);
    setDragging(false);
    gestureModeRef.current = "none";
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767.98px)");
    const update = () => setIsMobile(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
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
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeViewer();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        nextPhoto();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        prevPhoto();
      }

      if (event.key === "+") {
        event.preventDefault();
        updateScale(0.2);
      }

      if (event.key === "-") {
        event.preventDefault();
        updateScale(-0.2);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeViewer, nextPhoto, prevPhoto, updateScale]);

  useEffect(() => {
    if (!currentPhoto) return;

    const adjacent = [prevPhotoId, nextPhotoId]
      .map((photoId) => (photoId ? photos[photoId] : null))
      .filter((photo): photo is NonNullable<typeof photo> => Boolean(photo));

    adjacent.forEach((photo) => {
      const preload = new window.Image();
      preload.src = photo.url;
    });
  }, [currentPhoto, nextPhotoId, photos, prevPhotoId]);

  if (!currentPhoto) return null;

  return (
    <div
      ref={viewerRef}
      className="fixed inset-0 z-[100] flex h-screen w-screen items-center justify-center overflow-hidden bg-black"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <img
          src={currentPhoto.url}
          alt=""
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-3xl"
          draggable={false}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-0 bg-black/35" />

      <div
        className="relative flex h-full w-full items-center justify-center overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex h-full w-full items-center justify-center">
          <ViewerImage
            photoId={currentPhoto.id}
            src={currentPhoto.url}
            scale={scale}
            translate={translate}
            swipeOffsetX={swipeOffsetX}
            dragging={dragging}
            onMouseDown={onMouseDown}
            onDoubleClick={onDoubleClick}
          />
        </div>
      </div>

      <PhotoControls
        photoId={currentPhoto.id}
        onBackToGrid={closeViewer}
        onToggleComments={() => setCommentsOpen((value) => !value)}
        currentIndex={activeIndex + 1}
        totalPhotos={order.length}
        commentsOpen={commentsOpen}
      />

      {!isMobile ? (
        <>
          <button
            type="button"
            onClick={prevPhoto}
            disabled={!prevPhotoId}
            aria-label="Previous photo"
            className="absolute left-6 top-1/2 z-40 hidden -translate-y-1/2 rounded-full bg-black/40 p-3 backdrop-blur transition hover:bg-black/60 disabled:opacity-30 md:flex"
          >
            <Image
              src="/icons/ArrowLeftBold.svg"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 brightness-0 invert"
            />
          </button>

          <button
            type="button"
            onClick={nextPhoto}
            disabled={!nextPhotoId}
            aria-label="Next photo"
            className="absolute right-6 top-1/2 z-40 hidden -translate-y-1/2 rounded-full bg-black/40 p-3 backdrop-blur transition hover:bg-black/60 disabled:opacity-30 md:flex"
          >
            <Image
              src="/icons/ArrowRightBold.svg"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 brightness-0 invert"
            />
          </button>
        </>
      ) : null}

      <PhotoComments
        open={commentsOpen}
        photoId={currentPhoto.id}
        onClose={() => setCommentsOpen(false)}
      />
    </div>
  );
}
