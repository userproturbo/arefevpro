"use client";

import Image from "next/image";
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

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const CLOSE_DRAG_THRESHOLD = 140;
const SWIPE_DISTANCE_THRESHOLD = 80;
const SWIPE_VELOCITY_THRESHOLD = 0.6;
const SINGLE_TAP_DELAY_MS = 220;

type Translate = { x: number; y: number };
type GestureMode = "none" | "pan" | "swipe" | "close" | "pinch";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getTouchDistance(touches: TouchList) {
  if (touches.length < 2) return 0;
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

export default function PhotoViewer({ onClose }: PhotoViewerProps) {
  const activePhotoId = usePhotoStore((state) => state.activePhotoId);
  const order = usePhotoStore((state) => state.order);
  const photos = usePhotoStore((state) => state.photos);
  const setActivePhoto = usePhotoStore((state) => state.setActivePhoto);

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState<Translate>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [swipeOffsetX, setSwipeOffsetX] = useState(0);
  const [loadedPhotoId, setLoadedPhotoId] = useState<number | null>(null);

  const viewerRef = useRef<HTMLDivElement | null>(null);
  const dragStart = useRef<Translate>({ x: 0, y: 0 });
  const gestureModeRef = useRef<GestureMode>("none");

  const startY = useRef(0);
  const gestureStartX = useRef(0);
  const gestureStartTime = useRef(0);

  const pinchStartDistance = useRef<number | null>(null);
  const pinchStartScale = useRef(1);

  const tapTimeoutRef = useRef<number | null>(null);

  const prevPhotoIdRef = useRef<number | null>(null);
  const nextPhotoIdRef = useRef<number | null>(null);
  const onCloseRef = useRef(onClose);
  const setActivePhotoRef = useRef(setActivePhoto);
  const scaleRef = useRef(scale);

  const activeIndex = useMemo(() => {
    if (!activePhotoId) return -1;
    return order.findIndex((id) => id === activePhotoId);
  }, [activePhotoId, order]);

  const currentPhoto = activePhotoId ? photos[activePhotoId] : null;
  const currentPhotoKey = currentPhoto?.id ?? null;
  const prevPhotoId = activeIndex > 0 ? order[activeIndex - 1] : null;
  const nextPhotoId = activeIndex >= 0 && activeIndex < order.length - 1 ? order[activeIndex + 1] : null;

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    prevPhotoIdRef.current = prevPhotoId;
    nextPhotoIdRef.current = nextPhotoId;
  }, [nextPhotoId, prevPhotoId]);

  useEffect(() => {
    onCloseRef.current = onClose;
    setActivePhotoRef.current = setActivePhoto;
  }, [onClose, setActivePhoto]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767.98px)");
    const update = () => setIsMobile(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  const computePanBounds = useCallback((nextScale: number) => {
    const rect = viewerRef.current?.getBoundingClientRect();
    if (!rect) {
      return { maxOffsetX: 0, maxOffsetY: 0 };
    }

    const imageWidth = rect.width;
    const imageHeight = rect.height;
    const maxOffsetX = Math.max(0, ((imageWidth * nextScale) - imageWidth) / 2);
    const maxOffsetY = Math.max(0, ((imageHeight * nextScale) - imageHeight) / 2);

    return { maxOffsetX, maxOffsetY };
  }, []);

  const clampTranslate = useCallback((next: Translate, nextScale: number) => {
    if (nextScale <= 1) {
      return { x: 0, y: 0 };
    }

    const { maxOffsetX, maxOffsetY } = computePanBounds(nextScale);

    return {
      x: clamp(next.x, -maxOffsetX, maxOffsetX),
      y: clamp(next.y, -maxOffsetY, maxOffsetY),
    };
  }, [computePanBounds]);

  const resetInteractionState = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setDragging(false);
    setDragY(0);
    setSwipeOffsetX(0);
    setControlsVisible(true);
    gestureModeRef.current = "none";
    pinchStartDistance.current = null;
    pinchStartScale.current = 1;
  }, []);

  const closeViewer = useCallback(() => {
    setCommentsOpen(false);
    resetInteractionState();
    setActivePhotoRef.current(null);
    onCloseRef.current();
  }, [resetInteractionState]);

  const nextPhoto = useCallback(() => {
    const id = nextPhotoIdRef.current;
    if (!id) return;
    resetInteractionState();
    setActivePhotoRef.current(id);
  }, [resetInteractionState]);

  const prevPhoto = useCallback(() => {
    const id = prevPhotoIdRef.current;
    if (!id) return;
    resetInteractionState();
    setActivePhotoRef.current(id);
  }, [resetInteractionState]);

  const updateScale = useCallback((updater: (prev: number) => number) => {
    setScale((prev) => {
      const next = clamp(updater(prev), MIN_SCALE, MAX_SCALE);
      if (next <= 1) {
        setTranslate({ x: 0, y: 0 });
      } else {
        setTranslate((prevTranslate) => clampTranslate(prevTranslate, next));
      }
      return next;
    });
  }, [clampTranslate]);

  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();

    updateScale((prev) => prev + (event.deltaY < 0 ? 0.15 : -0.15));
  }, [updateScale]);

  const onMouseDown = (event: MouseEvent<HTMLImageElement>) => {
    if (scale <= 1) return;
    event.preventDefault();
    setDragging(true);
    gestureModeRef.current = "pan";
    dragStart.current = {
      x: event.clientX - translate.x,
      y: event.clientY - translate.y,
    };
  };

  const onMouseMove = useCallback((event: globalThis.MouseEvent) => {
    if (!dragging || scaleRef.current <= 1) return;

    const next = {
      x: event.clientX - dragStart.current.x,
      y: event.clientY - dragStart.current.y,
    };

    setTranslate(clampTranslate(next, scaleRef.current));
  }, [clampTranslate, dragging]);

  const onMouseUp = useCallback(() => {
    setDragging(false);
    if (gestureModeRef.current === "pan") {
      gestureModeRef.current = "none";
    }
  }, []);

  const handleSingleTap = useCallback(() => {
    if (!isMobile) return;
    setControlsVisible((value) => !value);
  }, [isMobile]);

  const handleDoubleClick = () => {
    if (tapTimeoutRef.current) {
      window.clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = null;
    }

    if (scale === 1) {
      updateScale(() => 2);
      return;
    }

    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  const onImageClick = () => {
    if (!isMobile) return;
    if (tapTimeoutRef.current) return;

    tapTimeoutRef.current = window.setTimeout(() => {
      tapTimeoutRef.current = null;
      handleSingleTap();
    }, SINGLE_TAP_DELAY_MS);
  };

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 2) {
      pinchStartDistance.current = getTouchDistance(event.touches);
      pinchStartScale.current = scaleRef.current;
      gestureModeRef.current = "pinch";
      return;
    }

    const touch = event.touches[0];
    if (!touch) return;

    startY.current = touch.clientY;
    gestureStartX.current = touch.clientX;
    gestureStartTime.current = Date.now();

    if (scaleRef.current > 1) {
      gestureModeRef.current = "pan";
      setDragging(true);
      dragStart.current = {
        x: touch.clientX - translate.x,
        y: touch.clientY - translate.y,
      };
      return;
    }

    gestureModeRef.current = "none";
  };

  const onTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 2) {
      if (!pinchStartDistance.current) return;
      const distance = getTouchDistance(event.touches);
      const ratio = distance / pinchStartDistance.current;
      const nextScale = clamp(pinchStartScale.current * ratio, MIN_SCALE, MAX_SCALE);
      setScale(nextScale);
      setTranslate((prev) => clampTranslate(prev, nextScale));
      gestureModeRef.current = "pinch";
      return;
    }

    const touch = event.touches[0];
    if (!touch) return;

    const deltaX = touch.clientX - gestureStartX.current;
    const deltaY = touch.clientY - startY.current;

    if (scaleRef.current > 1 || gestureModeRef.current === "pan") {
      gestureModeRef.current = "pan";
      const next = {
        x: touch.clientX - dragStart.current.x,
        y: touch.clientY - dragStart.current.y,
      };
      setTranslate(clampTranslate(next, scaleRef.current));
      return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 8) {
      gestureModeRef.current = "swipe";
      setSwipeOffsetX(deltaX);
      setDragY(0);
      return;
    }

    if (deltaY > 0) {
      gestureModeRef.current = "close";
      setDragY(deltaY);
      setSwipeOffsetX(0);
    }
  };

  const onTouchEnd = () => {
    if (pinchStartDistance.current && gestureModeRef.current === "pinch") {
      pinchStartDistance.current = null;
      gestureModeRef.current = "none";
      setDragging(false);
      return;
    }

    if (gestureModeRef.current === "swipe" && scaleRef.current === 1) {
      const duration = Math.max(Date.now() - gestureStartTime.current, 1);
      const deltaX = swipeOffsetX;
      const velocity = deltaX / duration;

      if (deltaX < -SWIPE_DISTANCE_THRESHOLD || velocity < -SWIPE_VELOCITY_THRESHOLD) {
        nextPhoto();
      } else if (deltaX > SWIPE_DISTANCE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD) {
        prevPhoto();
      } else {
        setSwipeOffsetX(0);
      }

      gestureModeRef.current = "none";
      setDragging(false);
      return;
    }

    if (gestureModeRef.current === "close") {
      if (dragY > CLOSE_DRAG_THRESHOLD) {
        closeViewer();
        return;
      }
      setDragY(0);
      gestureModeRef.current = "none";
      return;
    }

    if (gestureModeRef.current === "pan") {
      setDragging(false);
      setTranslate((prev) => clampTranslate(prev, scaleRef.current));
      gestureModeRef.current = "none";
      return;
    }

    if (dragY > 0) {
      setDragY(0);
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
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
        updateScale((value) => value + 0.2);
      }
      if (event.key === "-") {
        event.preventDefault();
        updateScale((value) => value - 0.2);
      }
      if (event.key === "0") {
        event.preventDefault();
        setScale(1);
        setTranslate({ x: 0, y: 0 });
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeViewer, nextPhoto, prevPhoto, updateScale]);

  useEffect(() => {
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  useEffect(() => {
    const neighbors = [order[activeIndex - 1], order[activeIndex + 1]]
      .map((id) => (id ? photos[id] : null))
      .filter((photo): photo is NonNullable<typeof photo> => Boolean(photo));

    neighbors.forEach((photo) => {
      const img = new window.Image();
      img.src = photo.url;
    });
  }, [activeIndex, order, photos]);

  useEffect(() => {
    if (currentPhotoKey === null) return;

    const rafId = window.requestAnimationFrame(() => {
      resetInteractionState();
      setLoadedPhotoId(null);
      setControlsVisible(true);
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [currentPhotoKey, resetInteractionState]);

  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) {
        window.clearTimeout(tapTimeoutRef.current);
      }
    };
  }, []);

  if (!currentPhoto) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-white/70">
        Photo not found.
      </div>
    );
  }

  const overlayOpacity = Math.max(0.35, 1 - dragY / 300);

  return (
    <div
      ref={viewerRef}
      className="relative flex h-[92vh] min-h-[420px] w-full items-center justify-center overflow-hidden pt-12 pb-10"
      style={{
        backgroundColor: `rgba(0,0,0,${overlayOpacity})`,
      }}
    >
      <div
        className="relative flex h-full w-full items-center justify-center"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <Image
          key={currentPhoto.id}
          src={currentPhoto.url}
          alt=""
          width={1800}
          height={1200}
          priority
          onMouseDown={onMouseDown}
          onClick={onImageClick}
          onDoubleClick={handleDoubleClick}
          onLoad={() => setLoadedPhotoId(currentPhoto.id)}
          className={`block h-auto max-h-full max-w-full object-contain transform-gpu will-change-transform transition-opacity duration-300 ${
            loadedPhotoId === currentPhoto.id ? "opacity-100" : "opacity-0"
          }`}
          style={{
            transform: `translate3d(${translate.x + swipeOffsetX}px, ${translate.y + dragY}px, 0) scale(${scale})`,
            transition: dragging
              ? "none"
              : "transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease",
            willChange: "transform",
            backfaceVisibility: "hidden",
            cursor: scale > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in",
          }}
        />
      </div>

      <PhotoControls
        photoId={currentPhoto.id}
        onBackToGrid={closeViewer}
        onToggleComments={() => {
          setCommentsOpen((prev) => !prev);
          setControlsVisible(true);
        }}
        className={[
          "transition-opacity duration-200",
          isMobile && !controlsVisible && !commentsOpen ? "opacity-0 pointer-events-none" : "opacity-100",
        ].join(" ")}
      />

      <button
        type="button"
        onClick={prevPhoto}
        disabled={!prevPhotoId}
        aria-label="Previous photo"
        className="pointer-events-auto absolute left-10 top-1/2 z-30 -translate-y-1/2 opacity-80 transition hover:opacity-100 disabled:opacity-30"
      >
        <Image src="/icons/ArrowLeftBold.svg" alt="" width={28} height={28} className="h-7 w-7 brightness-0 invert" />
      </button>
      <button
        type="button"
        onClick={nextPhoto}
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
