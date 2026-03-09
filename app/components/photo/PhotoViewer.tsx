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

export default function PhotoViewer({ onClose }: PhotoViewerProps) {
  const activePhotoId = usePhotoStore((state) => state.activePhotoId);
  const order = usePhotoStore((state) => state.order);
  const photos = usePhotoStore((state) => state.photos);
  const setActivePhoto = usePhotoStore((state) => state.setActivePhoto);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [loadedPhotoId, setLoadedPhotoId] = useState<number | null>(null);
  const startY = useRef(0);
  const dragStart = useRef({ x: 0, y: 0 });
  const prevPhotoIdRef = useRef<number | null>(null);
  const nextPhotoIdRef = useRef<number | null>(null);
  const onCloseRef = useRef(onClose);
  const setActivePhotoRef = useRef(setActivePhoto);

  const activeIndex = useMemo(() => {
    if (!activePhotoId) return -1;
    return order.findIndex((id) => id === activePhotoId);
  }, [activePhotoId, order]);

  const currentPhoto = activePhotoId ? photos[activePhotoId] : null;
  const prevPhotoId = activeIndex > 0 ? order[activeIndex - 1] : null;
  const nextPhotoId = activeIndex >= 0 && activeIndex < order.length - 1 ? order[activeIndex + 1] : null;
  const nextPhotoData = nextPhotoId ? photos[nextPhotoId] : null;

  const closeViewer = useCallback(() => {
    setCommentsOpen(false);
    setDragging(false);
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setDragY(0);
    setActivePhotoRef.current(null);
    onCloseRef.current();
  }, []);

  const nextPhoto = useCallback(() => {
    const id = nextPhotoIdRef.current;
    if (!id) return;
    setDragging(false);
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setDragY(0);
    setActivePhotoRef.current(id);
  }, []);

  const prevPhoto = useCallback(() => {
    const id = prevPhotoIdRef.current;
    if (!id) return;
    setDragging(false);
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setDragY(0);
    setActivePhotoRef.current(id);
  }, []);

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    startY.current = event.touches[0]?.clientY ?? 0;
  };

  const onTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const delta = (event.touches[0]?.clientY ?? 0) - startY.current;
    if (delta > 0) {
      setDragY(delta);
    }
  };

  const onTouchEnd = () => {
    if (dragY > 150) {
      closeViewer();
      return;
    }
    setDragY(0);
  };

  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();

    setScale((prev) => {
      const next = prev + (event.deltaY < 0 ? 0.15 : -0.15);
      const clamped = Math.min(Math.max(next, 1), 4);
      if (clamped === 1) {
        setTranslate({ x: 0, y: 0 });
      }
      return clamped;
    });
  }, []);

  const onMouseDown = (event: MouseEvent<HTMLImageElement>) => {
    if (scale === 1) return;
    event.preventDefault();
    setDragging(true);
    dragStart.current = {
      x: event.clientX - translate.x,
      y: event.clientY - translate.y,
    };
  };

  const onMouseMove = useCallback((event: globalThis.MouseEvent) => {
    if (!dragging) return;

    setTranslate({
      x: event.clientX - dragStart.current.x,
      y: event.clientY - dragStart.current.y,
    });
  }, [dragging]);

  const onMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  const handleDoubleClick = () => {
    if (scale === 1) {
      setScale(2);
      return;
    }
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging, onMouseMove, onMouseUp]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const closeViewerLocal = () => {
        setCommentsOpen(false);
        setDragging(false);
        setScale(1);
        setTranslate({ x: 0, y: 0 });
        setDragY(0);
        setActivePhotoRef.current(null);
        onCloseRef.current();
      };

      const nextPhotoLocal = () => {
        const id = nextPhotoIdRef.current;
        if (!id) return;
        setDragging(false);
        setScale(1);
        setTranslate({ x: 0, y: 0 });
        setDragY(0);
        setActivePhotoRef.current(id);
      };

      const prevPhotoLocal = () => {
        const id = prevPhotoIdRef.current;
        if (!id) return;
        setDragging(false);
        setScale(1);
        setTranslate({ x: 0, y: 0 });
        setDragY(0);
        setActivePhotoRef.current(id);
      };

      if (event.key === "Escape") {
        event.preventDefault();
        closeViewerLocal();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        nextPhotoLocal();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        prevPhotoLocal();
      }
      if (event.key === "+") {
        event.preventDefault();
        setScale((value) => Math.min(value + 0.2, 4));
      }
      if (event.key === "-") {
        event.preventDefault();
        setScale((value) => {
          const next = Math.max(value - 0.2, 1);
          if (next === 1) {
            setTranslate({ x: 0, y: 0 });
          }
          return next;
        });
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!nextPhotoData) return;

    const img = new window.Image();
    img.src = nextPhotoData.url;
  }, [activeIndex, nextPhotoData]);

  useEffect(() => {
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => window.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  useEffect(() => {
    onCloseRef.current = onClose;
    setActivePhotoRef.current = setActivePhoto;
  }, [onClose, setActivePhoto]);

  useEffect(() => {
    prevPhotoIdRef.current = prevPhotoId;
    nextPhotoIdRef.current = nextPhotoId;
  }, [nextPhotoId, prevPhotoId]);

  if (!currentPhoto) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-white/70">
        Photo not found.
      </div>
    );
  }

  return (
    <div className="relative flex h-[92vh] min-h-[420px] w-full items-center justify-center overflow-hidden pt-12 pb-10">
      <div
        className="relative flex h-full w-full items-center justify-center"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform: `translateY(${dragY}px)`,
          transition: dragY === 0 ? "transform .25s ease" : "none",
        }}
      >
        <Image
          key={currentPhoto.id}
          src={currentPhoto.url}
          alt=""
          width={1800}
          height={1200}
          priority
          onMouseDown={onMouseDown}
          onDoubleClick={handleDoubleClick}
          onLoad={() => setLoadedPhotoId(currentPhoto.id)}
          className={`block h-auto max-h-full max-w-full object-contain transition-opacity duration-300 ${
            loadedPhotoId === currentPhoto.id ? "opacity-100" : "opacity-0"
          }`}
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transition: dragging ? "none" : "transform 0.25s ease",
            cursor: scale > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in",
          }}
        />
      </div>

      <PhotoControls
        photoId={currentPhoto.id}
        onBackToGrid={() => {
          closeViewer();
        }}
        onToggleComments={() => setCommentsOpen((prev) => !prev)}
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
