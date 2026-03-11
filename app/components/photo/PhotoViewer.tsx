"use client";

import Image from "next/image";
import { FastAverageColor } from "fast-average-color";
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
import { usePhotoGestures } from "./usePhotoGestures";

type PhotoViewerProps = {
  onClose: () => void;
};

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const CLOSE_DRAG_THRESHOLD = 140;
const SWIPE_DISTANCE_THRESHOLD = 80;
const SWIPE_VELOCITY_THRESHOLD = 0.45;
const PREFETCH_RANGE = 4;

type Translate = { x: number; y: number };
type GestureMode = "none" | "pan" | "swipe" | "close" | "pinch";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function PhotoViewer({ onClose }: PhotoViewerProps) {
  const activePhotoId = usePhotoStore((state) => state.activePhotoId);
  const order = usePhotoStore((state) => state.order);
  const photos = usePhotoStore((state) => state.photos);
  const setActivePhoto = usePhotoStore((state) => state.setActivePhoto);

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [uiVisible, setUiVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showArrows, setShowArrows] = useState(true);

  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState<Translate>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [swipeOffsetX, setSwipeOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [loadedPhotoId, setLoadedPhotoId] = useState<number | null>(null);
  const [viewerReady, setViewerReady] = useState(false);
  const [controlsDimmed, setControlsDimmed] = useState(false);
  const [dominantColor, setDominantColor] = useState("rgb(20, 20, 20)");
  const [viewerWidth, setViewerWidth] = useState(1);
  const [imageFailed, setImageFailed] = useState(false);
  const [imageReady, setImageReady] = useState(false);

  const viewerRef = useRef<HTMLDivElement | null>(null);
  const dragStart = useRef<Translate>({ x: 0, y: 0 });
  const gestureModeRef = useRef<GestureMode>("none");

  const startY = useRef(0);
  const gestureStartX = useRef(0);
  const gestureStartTime = useRef(0);
  const {
    pinchStartDistanceRef,
    pinchStartScaleRef,
    getTouchDistance,
    resolveSwipe,
    resetPinch,
    registerTap,
    scheduleSingleTap,
    clearTapTimers,
    rubberBand,
  } = usePhotoGestures();

  const prevPhotoIdRef = useRef<number | null>(null);
  const nextPhotoIdRef = useRef<number | null>(null);
  const onCloseRef = useRef(onClose);
  const setActivePhotoRef = useRef(setActivePhoto);
  const scaleRef = useRef(scale);
  const controlsFadeTimeoutRef = useRef<number | null>(null);
  const uiHideTimeoutRef = useRef<number | null>(null);
  const facRef = useRef<FastAverageColor | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const swipeRafRef = useRef<number | null>(null);

  const activeIndex = useMemo(() => {
    if (!activePhotoId) return -1;
    return order.findIndex((id) => id === activePhotoId);
  }, [activePhotoId, order]);

  const photoList = order.map((id) => photos[id]).filter(Boolean);
  const safeIndex = Math.max(0, Math.min(activeIndex, photoList.length - 1));
  const currentPhoto = photoList[safeIndex] ?? null;
  const currentPhotoKey = currentPhoto?.id ?? null;
  const prevPhoto = safeIndex > 0 ? photoList[safeIndex - 1] : null;
  const nextPhoto = safeIndex >= 0 && safeIndex < photoList.length - 1 ? photoList[safeIndex + 1] : null;
  const prevPhotoId = prevPhoto?.id ?? null;
  const nextPhotoId = nextPhoto?.id ?? null;
  const currentIndexLabel = photoList.length > 0 ? safeIndex + 1 : 0;

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
    const rafId = window.requestAnimationFrame(() => setViewerReady(true));
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    if (!facRef.current) {
      facRef.current = new FastAverageColor();
    }

    return () => {
      facRef.current?.destroy();
      facRef.current = null;
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767.98px)");
    const update = () => {
      const mobile = mediaQuery.matches;
      setIsMobile(mobile);
      setShowArrows(true);
      setViewerWidth(Math.max(viewerRef.current?.clientWidth ?? window.innerWidth ?? 1, 1));
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    mediaQuery.addEventListener("change", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      mediaQuery.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyTouchAction = document.body.style.touchAction;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.touchAction = originalBodyTouchAction;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  const scheduleUiHide = useCallback(() => {
    if (uiHideTimeoutRef.current) {
      window.clearTimeout(uiHideTimeoutRef.current);
    }
    uiHideTimeoutRef.current = window.setTimeout(() => {
      setUiVisible(false);
      uiHideTimeoutRef.current = null;
    }, 2500);
  }, []);

  const revealUi = useCallback(() => {
    setUiVisible(true);
    scheduleUiHide();
  }, [scheduleUiHide]);

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
    setIsSwiping(false);
    setSwipeOffsetX(0);
    setControlsDimmed(false);
    setUiVisible(true);
    gestureModeRef.current = "none";
    resetPinch();
    if (swipeRafRef.current !== null) {
      window.cancelAnimationFrame(swipeRafRef.current);
      swipeRafRef.current = null;
    }
  }, [resetPinch]);

  const closeViewer = useCallback(() => {
    setCommentsOpen(false);
    resetInteractionState();
    setActivePhotoRef.current(null);
    onCloseRef.current();
  }, [resetInteractionState]);

  const goToNextPhoto = useCallback(() => {
    const id = nextPhotoIdRef.current;
    if (!id) return;
    resetInteractionState();
    setActivePhotoRef.current(id);
  }, [resetInteractionState]);

  const goToPrevPhoto = useCallback(() => {
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

  const bumpControlsFade = useCallback(() => {
    revealUi();
    setControlsDimmed(true);
    if (controlsFadeTimeoutRef.current) {
      window.clearTimeout(controlsFadeTimeoutRef.current);
    }
    controlsFadeTimeoutRef.current = window.setTimeout(() => {
      setControlsDimmed(false);
      controlsFadeTimeoutRef.current = null;
    }, 1200);
  }, [revealUi]);

  const setImageElement = useCallback((img: HTMLImageElement | null) => {
    imageRef.current = img;

    if (!img || currentPhotoKey === null) {
      return;
    }

    if (img.complete && img.naturalWidth > 0) {
      setImageReady(true);
      setLoadedPhotoId(currentPhotoKey);
    }
  }, [currentPhotoKey]);

  const setSwipeOffsetXDeferred = useCallback((value: number) => {
    if (swipeRafRef.current !== null) {
      window.cancelAnimationFrame(swipeRafRef.current);
    }

    swipeRafRef.current = window.requestAnimationFrame(() => {
      setSwipeOffsetX(value);
      swipeRafRef.current = null;
    });
  }, []);

  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();
    bumpControlsFade();

    updateScale((prev) => prev + (event.deltaY < 0 ? 0.15 : -0.15));
  }, [bumpControlsFade, updateScale]);

  const onMouseDown = (event: MouseEvent<HTMLImageElement>) => {
    if (scale <= 1) return;
    event.preventDefault();
    bumpControlsFade();
    setDragging(true);
    gestureModeRef.current = "pan";
    dragStart.current = {
      x: event.clientX - translate.x,
      y: event.clientY - translate.y,
    };
  };

  const onMouseMove = useCallback((event: globalThis.MouseEvent) => {
    if (!dragging || scaleRef.current <= 1) return;
    bumpControlsFade();

    const next = {
      x: event.clientX - dragStart.current.x,
      y: event.clientY - dragStart.current.y,
    };

    setTranslate(clampTranslate(next, scaleRef.current));
  }, [bumpControlsFade, clampTranslate, dragging]);

  const onMouseUp = useCallback(() => {
    setDragging(false);
    if (gestureModeRef.current === "pan") {
      gestureModeRef.current = "none";
    }
  }, []);

  const handleSingleTap = useCallback(() => {
    if (!isMobile) return;
    revealUi();
  }, [isMobile, revealUi]);

  const zoomToPoint = useCallback((clientX: number, clientY: number, target: HTMLElement | null) => {
    if (!target) return;

    if (scale !== 1) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
      return;
    }

    const rect = target.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      updateScale(() => 2);
      return;
    }

    const ratioX = (clientX - rect.left) / rect.width - 0.5;
    const ratioY = (clientY - rect.top) / rect.height - 0.5;
    const nextScale = Math.min(MAX_SCALE, Math.max(2, rect.width / 600));
    const nextTranslate = clampTranslate(
      {
        x: -ratioX * rect.width,
        y: -ratioY * rect.height,
      },
      nextScale
    );

    setScale(nextScale);
    setTranslate(nextTranslate);
  }, [clampTranslate, scale, updateScale]);

  const handleDoubleClick = (event: MouseEvent<HTMLImageElement>) => {
    zoomToPoint(event.clientX, event.clientY, event.currentTarget);
  };

  const onImageClick = (event: MouseEvent<HTMLImageElement>) => {
    if (!isMobile) return;
    revealUi();
    const tapType = registerTap();

    if (tapType === "double") {
      zoomToPoint(event.clientX, event.clientY, event.currentTarget);
      return;
    }

    scheduleSingleTap(() => {
      handleSingleTap();
    });
  };

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    revealUi();
    setIsSwiping(false);
    if (event.touches.length === 2) {
      bumpControlsFade();
      pinchStartDistanceRef.current = getTouchDistance(event.touches);
      pinchStartScaleRef.current = scaleRef.current;
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
      if (!pinchStartDistanceRef.current) return;
      bumpControlsFade();
      const distance = getTouchDistance(event.touches);
      const ratio = distance / pinchStartDistanceRef.current;
      const nextScale = clamp(pinchStartScaleRef.current * ratio, MIN_SCALE, MAX_SCALE);
      setScale(nextScale);
      if (nextScale <= 1) {
        setTranslate({ x: 0, y: 0 });
      }
      setTranslate((prev) => clampTranslate(prev, nextScale));
      gestureModeRef.current = "pinch";
      return;
    }

    const touch = event.touches[0];
    if (!touch) return;

    const deltaX = touch.clientX - gestureStartX.current;
    const deltaY = touch.clientY - startY.current;

    if (scaleRef.current > 1 || gestureModeRef.current === "pan") {
      bumpControlsFade();
      gestureModeRef.current = "pan";
      const next = {
        x: touch.clientX - dragStart.current.x,
        y: touch.clientY - dragStart.current.y,
      };
      setTranslate(clampTranslate(next, scaleRef.current));
      return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 8) {
      bumpControlsFade();
      gestureModeRef.current = "swipe";
      setIsSwiping(true);
      setSwipeOffsetXDeferred(deltaX);
      setDragY(0);
      return;
    }

    if (deltaY > 0) {
      bumpControlsFade();
      setIsSwiping(false);
      gestureModeRef.current = "close";
      setDragY(rubberBand(deltaY));
      setSwipeOffsetX(0);
    }
  };

  const onTouchEnd = () => {
    setIsSwiping(false);
    if (pinchStartDistanceRef.current && gestureModeRef.current === "pinch") {
      resetPinch();
      gestureModeRef.current = "none";
      setDragging(false);
      return;
    }

    if (gestureModeRef.current === "swipe" && scaleRef.current === 1) {
      const duration = Math.max(Date.now() - gestureStartTime.current, 1);
      const deltaX = swipeOffsetX;
      const velocity = deltaX / duration;
      const swipeDecision = resolveSwipe(
        deltaX,
        velocity,
        SWIPE_DISTANCE_THRESHOLD,
        SWIPE_VELOCITY_THRESHOLD
      );
      if (swipeDecision === "next") goToNextPhoto();
      if (swipeDecision === "prev") goToPrevPhoto();
      if (swipeDecision === "none") setSwipeOffsetX((prev) => prev * 0.25);

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
    const resetDrag = () => {
      setDragging(false);
      gestureModeRef.current = "none";
    };

    window.addEventListener("blur", resetDrag);
    document.addEventListener("mouseleave", resetDrag);

    return () => {
      window.removeEventListener("blur", resetDrag);
      document.removeEventListener("mouseleave", resetDrag);
    };
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeViewer();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToNextPhoto();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPrevPhoto();
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
  }, [closeViewer, goToNextPhoto, goToPrevPhoto, updateScale]);

  useEffect(() => {
    const neighbors = [];

    for (let i = 1; i <= PREFETCH_RANGE; i++) {
      const prev = order[activeIndex - i];
      const next = order[activeIndex + i];

      if (prev) neighbors.push(photos[prev]);
      if (next) neighbors.push(photos[next]);
    }

    neighbors
      .filter((photo): photo is NonNullable<typeof photo> => Boolean(photo))
      .forEach((photo) => {
      const img = new window.Image();
      img.src = photo.url;
      if (img.decode) {
        img.decode().catch(() => {});
      }
    });
  }, [activeIndex, order, photos]);

  useEffect(() => {
    if (currentPhotoKey === null) return;

    const rafId = window.requestAnimationFrame(() => {
      resetInteractionState();
      setLoadedPhotoId(null);
      setImageReady(false);
      setImageFailed(false);
      setUiVisible(true);
      setCommentsOpen(false);
      scheduleUiHide();
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [currentPhotoKey, resetInteractionState, scheduleUiHide]);

  useEffect(() => {
    if (commentsOpen) {
      if (uiHideTimeoutRef.current) {
        window.clearTimeout(uiHideTimeoutRef.current);
        uiHideTimeoutRef.current = null;
      }
      return;
    }
    scheduleUiHide();
  }, [commentsOpen, scheduleUiHide]);

  useEffect(() => {
    if (!imageRef.current || !currentPhoto || loadedPhotoId !== currentPhoto.id) {
      return;
    }

    if (!facRef.current) {
      facRef.current = new FastAverageColor();
    }

    facRef.current
      .getColorAsync(imageRef.current)
      .then((color) => {
        const [cr = 20, cg = 20, cb = 20] = color.value ?? [20, 20, 20];
        const luminance = 0.2126 * cr + 0.7152 * cg + 0.0722 * cb;

        if (luminance < 40) {
          setDominantColor("rgb(20,20,20)");
          return;
        }

        if (luminance > 200) {
          setDominantColor(`rgb(${Math.floor(cr * 0.7)}, ${Math.floor(cg * 0.7)}, ${Math.floor(cb * 0.7)})`);
          return;
        }

        setDominantColor(color.rgb ?? `rgb(${cr}, ${cg}, ${cb})`);
      })
      .catch(() => {
        setDominantColor("rgb(20,20,20)");
      });
  }, [currentPhoto, loadedPhotoId]);

  useEffect(() => {
    return () => {
      const img = imageRef.current;
      if (img) {
        img.src = "";
      }
    };
  }, [currentPhoto.id]);

  useEffect(() => {
    return () => {
      if (swipeRafRef.current !== null) {
        window.cancelAnimationFrame(swipeRafRef.current);
      }
      clearTapTimers();
      if (controlsFadeTimeoutRef.current) {
        window.clearTimeout(controlsFadeTimeoutRef.current);
      }
      if (uiHideTimeoutRef.current) {
        window.clearTimeout(uiHideTimeoutRef.current);
      }
    };
  }, [clearTapTimers]);

  if (!currentPhoto) return null;

  const overlayOpacity = Math.max(0.35, 1 - dragY / 300);
  const imageOffsetX = translate.x + swipeOffsetX;
  const imageOffsetY = translate.y + dragY;
  const backgroundOffsetX = imageOffsetX * 0.2;
  const backgroundOffsetY = imageOffsetY * 0.2;
  const tintValues = dominantColor.replace("rgb(", "").replace(")", "");
  const backgroundTint = `rgba(${tintValues}, 0.12)`;
  const swipeProgress = scale === 1 ? Math.min(Math.abs(swipeOffsetX) / viewerWidth, 1) : 0;
  const currentOpacity = scale === 1 ? 1 - 0.3 * swipeProgress : 1;
  const nextOpacity = swipeOffsetX < 0 ? 0.6 + 0.4 * swipeProgress : 0.6;
  const prevOpacity = swipeOffsetX > 0 ? 0.6 + 0.4 * swipeProgress : 0.6;
  const isCurrentImageVisible = loadedPhotoId === currentPhoto.id || imageReady;

  return (
    <div
      ref={viewerRef}
      onWheel={(e) => {
        if (!viewerRef.current?.contains(e.target as Node)) return;
        handleWheel(e.nativeEvent);
      }}
      className="fixed inset-0 z-[100] flex w-full items-center justify-center overflow-hidden bg-black opacity-100"
      style={{
        backgroundColor: backgroundTint,
        boxShadow: `inset 0 0 0 9999px rgba(0,0,0,${overlayOpacity})`,
        opacity: viewerReady ? 1 : 0,
        transform: viewerReady ? "scale(1)" : "scale(0.97)",
        touchAction: "none",
        transition:
          "opacity 200ms ease-out, transform 200ms ease-out, background-color 220ms ease-out, box-shadow 300ms ease",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <motion.img
          src={currentPhoto.url}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
          layoutId={`photo-bg-${currentPhoto.id}`}
          style={{
            filter: "blur(60px) brightness(0.7)",
            transform: `translate3d(${backgroundOffsetX}px, ${backgroundOffsetY}px, 0) scale(1.2)`,
            willChange: "transform",
            backfaceVisibility: "hidden",
            mixBlendMode: "screen",
            backgroundColor: backgroundTint,
            transition: "background-color 300ms ease",
          }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.95) 100%)",
        }}
      />

      <div
        className="relative flex h-full w-full items-center justify-center overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 will-change-transform"
            style={{
              transform: `translate3d(${imageOffsetX}px, ${imageOffsetY}px, 0) scale(${scale})`,
              transition: dragging || isSwiping ? "none" : "transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
              willChange: "transform",
              contain: "layout paint size",
              backfaceVisibility: "hidden",
              transformStyle: "preserve-3d",
            }}
          >
            {prevPhoto ? (
              <div
                className="absolute inset-0"
                style={{
                  transform: "translate3d(-100%, 0, 0)",
                  opacity: prevOpacity,
                  transition: "opacity 200ms ease",
                }}
              >
                <Image
                  src={prevPhoto.url}
                  alt=""
                fill
                sizes="100vw"
                placeholder={prevPhoto.blurUrl ? "blur" : "empty"}
                blurDataURL={prevPhoto.blurUrl || undefined}
                className="block h-screen w-auto max-w-none object-contain md:max-h-full md:max-w-full"
              />
            </div>
          ) : null}

            <div
              className="absolute inset-0"
              onMouseDown={onMouseDown}
              onClick={onImageClick}
              onDoubleClick={handleDoubleClick}
              style={{
                cursor: scale > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in",
              }}
            >
              <Image
                key={currentPhoto.id}
                ref={setImageElement}
                src={currentPhoto.url}
                alt=""
                fill
                loading="eager"
                decoding="async"
                fetchPriority="high"
                sizes="100vw"
                placeholder={currentPhoto.blurUrl ? "blur" : "empty"}
                blurDataURL={currentPhoto.blurUrl || undefined}
                onLoadingComplete={(img) => {
                  imageRef.current = img;
                  setImageReady(true);
                  setLoadedPhotoId(currentPhoto.id);
                }}
                onError={() => {
                  setImageFailed(true);
                }}
                className={[
                  "relative z-10 block h-screen w-auto max-w-none object-contain transition-[opacity,filter,transform] duration-400 md:max-h-full md:max-w-full",
                  isCurrentImageVisible
                    ? "opacity-100 blur-0 scale-100"
                    : "opacity-0 blur-[18px] scale-[1.03]",
                ].join(" ")}
                style={{
                  opacity: isCurrentImageVisible ? currentOpacity : 0,
                  imageRendering: "auto",
                  backfaceVisibility: "hidden",
                }}
                priority
              />
              {imageFailed ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />
                  <div className="relative h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
                </div>
              ) : null}
            </div>

            {nextPhoto ? (
              <div
                className="absolute inset-0"
                style={{
                  transform: "translate3d(100%, 0, 0)",
                  opacity: nextOpacity,
                  transition: "opacity 200ms ease",
                }}
              >
                <Image
                  src={nextPhoto.url}
                  alt=""
                fill
                sizes="100vw"
                placeholder={nextPhoto.blurUrl ? "blur" : "empty"}
                blurDataURL={nextPhoto.blurUrl || undefined}
                className="block h-screen w-auto max-w-none object-contain md:max-h-full md:max-w-full"
              />
            </div>
          ) : null}
          </div>
        </div>
      </div>

      <PhotoControls
        photoId={currentPhoto.id}
        onBackToGrid={closeViewer}
        onToggleComments={() => {
          setUiVisible(true);
          setCommentsOpen((prev) => !prev);
        }}
        currentIndex={currentIndexLabel}
        totalPhotos={order.length}
        commentsOpen={commentsOpen}
        controlBarStyle={{
          transition: "background-color 300ms ease",
        }}
        className={[
          "transition-opacity duration-200",
          isMobile && !uiVisible && !commentsOpen
            ? "opacity-0 pointer-events-none"
            : controlsDimmed && !commentsOpen
              ? "opacity-40"
              : "opacity-100",
        ].join(" ")}
      />

      <div className="pointer-events-none absolute inset-x-0 top-[120px] bottom-[120px] z-30">
        <button
          type="button"
          onClick={goToPrevPhoto}
          disabled={!prevPhotoId}
          aria-label="Previous photo"
          className={[
            "pointer-events-auto absolute left-[max(24px,10vw)] top-1/2 -translate-y-1/2 opacity-80 transition hover:opacity-100 disabled:opacity-30",
            showArrows ? "block" : "hidden",
          ].join(" ")}
        >
          <Image src="/icons/ArrowLeftBold.svg" alt="" width={28} height={28} className="h-7 w-7 brightness-0 invert" />
        </button>
        <button
          type="button"
          onClick={goToNextPhoto}
          disabled={!nextPhotoId}
          aria-label="Next photo"
          className={[
            "pointer-events-auto absolute right-[max(24px,10vw)] top-1/2 -translate-y-1/2 opacity-80 transition hover:opacity-100 disabled:opacity-30",
            showArrows ? "block" : "hidden",
          ].join(" ")}
        >
          <Image src="/icons/ArrowRightBold.svg" alt="" width={28} height={28} className="h-7 w-7 brightness-0 invert" />
        </button>
      </div>

      <PhotoComments
        open={commentsOpen}
        photoId={currentPhoto.id}
        onClose={() => {
          setCommentsOpen(false);
          scheduleUiHide();
        }}
      />
    </div>
  );
}
