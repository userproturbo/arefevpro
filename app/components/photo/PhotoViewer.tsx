"use client";

import NextImage from "next/image";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import PhotoLikeButton from "./PhotoLikeButton";
import PhotoSectionShell from "./PhotoSectionShell";
import { usePhotoSwipe } from "./usePhotoSwipe";

type PhotoItem = {
  id: number;
  url: string;
};

type Props = {
  slug: string;
  photos: PhotoItem[];
  activeId: number;
  likesCount: number;
  likedByMe: boolean;
  commentCount?: number;
  onClose?: () => void;
  onNavigate?: (photoId: number) => void;
  onOpenComments?: () => void;
  showOverlayLike?: boolean;
  showEdgeNav?: boolean;
  showCloseButton?: boolean;
};

export default function PhotoViewer({
  slug,
  photos,
  activeId,
  likesCount,
  likedByMe,
  commentCount = 0,
  onClose,
  onNavigate,
  onOpenComments,
  showOverlayLike = true,
  showEdgeNav = false,
  showCloseButton = false,
}: Props) {
  const router = useRouter();
  const encodedSlug = encodeURIComponent(slug);
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

  const [uiVisible, setUiVisible] = useState(true);
  const hideTimerRef = useRef<number | null>(null);
  const hasOverlayControls = showEdgeNav || showCloseButton || showOverlayLike;

  const scheduleHide = useCallback(() => {
    if (!hasOverlayControls) return;
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = window.setTimeout(() => {
      setUiVisible(false);
      hideTimerRef.current = null;
    }, 2000);
  }, [hasOverlayControls]);

  const revealControls = useCallback(() => {
    if (!hasOverlayControls) return;
    setUiVisible(true);
    scheduleHide();
  }, [hasOverlayControls, scheduleHide]);

  useEffect(() => {
    const targets = [prevPhoto, nextPhoto].filter(
      (photo): photo is PhotoItem => !!photo
    );
    targets.forEach((photo) => {
      const image = new window.Image();
      image.src = photo.url;
    });
  }, [prevPhoto, nextPhoto]);

  useEffect(() => {
    scheduleHide();
    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, [activeId, scheduleHide]);

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
        if (onClose) {
          onClose();
        } else {
          router.push(`/photo/${encodedSlug}`, { scroll: false });
        }
        return;
      }

      if (event.key === "ArrowLeft" && prevPhoto) {
        event.preventDefault();
        revealControls();
        if (onNavigate) {
          onNavigate(prevPhoto.id);
        } else {
          router.replace(`/photo/${encodedSlug}/${prevPhoto.id}`, { scroll: false });
        }
      }

      if (event.key === "ArrowRight" && nextPhoto) {
        event.preventDefault();
        revealControls();
        if (onNavigate) {
          onNavigate(nextPhoto.id);
        } else {
          router.replace(`/photo/${encodedSlug}/${nextPhoto.id}`, { scroll: false });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [encodedSlug, nextPhoto, onClose, onNavigate, prevPhoto, revealControls, router]);

  const openPrev = () => {
    if (!prevPhoto) return;
    revealControls();
    if (onNavigate) {
      onNavigate(prevPhoto.id);
      return;
    }
    router.replace(`/photo/${encodedSlug}/${prevPhoto.id}`, { scroll: false });
  };

  const openNext = () => {
    if (!nextPhoto) return;
    revealControls();
    if (onNavigate) {
      onNavigate(nextPhoto.id);
      return;
    }
    router.replace(`/photo/${encodedSlug}/${nextPhoto.id}`, { scroll: false });
  };

  const swipe = usePhotoSwipe({
    onSwipeNext: openNext,
    onSwipePrev: openPrev,
    onSwipeUp: () => onOpenComments?.(),
    onSwipeDown: () => onClose?.(),
  });

  if (!activePhoto) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-white/70">
        Photo not found.
      </div>
    );
  }

  return (
    <div className="flex h-full w-full min-h-0 items-center justify-center">
      <motion.div
        key={activePhoto.id}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex h-full w-full items-center justify-center overflow-hidden"
        onMouseMove={revealControls}
        onClick={revealControls}
      >
        <div
          className="relative flex h-full w-full touch-pan-y select-none items-center justify-center"
          onClick={swipe.onDoubleTap}
          onTouchStart={(event) => {
            revealControls();
            swipe.onTouchStart(event);
          }}
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
        {showOverlayLike ? (
          <div
            className={[
              "absolute bottom-6 right-6 z-20 flex items-center gap-2 transition-opacity duration-250",
              uiVisible ? "opacity-100" : "pointer-events-none opacity-0",
            ].join(" ")}
          >
            <PhotoLikeButton
              photoId={activeId}
              initialCount={likesCount}
              initialLiked={likedByMe}
              variant="overlay"
              className="!static inline-flex h-12 items-center justify-center rounded-full bg-black/25 px-4 backdrop-blur-md transition hover:scale-110 hover:bg-black/40"
            />
            {onOpenComments ? (
              <button
                type="button"
                onClick={onOpenComments}
                className="inline-flex h-12 items-center justify-center gap-1 rounded-full bg-black/25 px-4 text-sm font-semibold text-white/95 backdrop-blur-md transition hover:scale-110 hover:bg-black/40"
              >
                <span>💬</span>
                <span>{commentCount}</span>
              </button>
            ) : null}
          </div>
        ) : null}

        {showEdgeNav ? (
          <>
            <button
              type="button"
              onClick={openPrev}
              disabled={!prevPhoto}
              aria-label="Previous photo"
              className={[
                "absolute left-6 top-1/2 z-20 h-12 w-12 -translate-y-1/2 rounded-full bg-black/30 backdrop-blur-md",
                "outline-none ring-0 focus:outline-none focus:ring-0",
                "flex items-center justify-center transition hover:scale-110 hover:bg-black/40 disabled:opacity-35",
                uiVisible ? "opacity-100" : "pointer-events-none opacity-0",
              ].join(" ")}
            >
              <NextImage src="/icons/ArrowLeftBold.svg" alt="" width={24} height={24} className="h-6 w-6 brightness-0 invert" />
            </button>
            <button
              type="button"
              onClick={openNext}
              disabled={!nextPhoto}
              aria-label="Next photo"
              className={[
                "absolute right-6 top-1/2 z-20 h-12 w-12 -translate-y-1/2 rounded-full bg-black/30 backdrop-blur-md",
                "outline-none ring-0 focus:outline-none focus:ring-0",
                "flex items-center justify-center transition hover:scale-110 hover:bg-black/40 disabled:opacity-35",
                uiVisible ? "opacity-100" : "pointer-events-none opacity-0",
              ].join(" ")}
            >
              <NextImage src="/icons/ArrowRightBold.svg" alt="" width={24} height={24} className="h-6 w-6 brightness-0 invert" />
            </button>
          </>
        ) : null}

        {showCloseButton && onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close viewer"
            className={[
              "absolute left-6 top-6 z-20 h-12 w-12 rounded-full bg-black/30 backdrop-blur-md",
              "outline-none ring-0 focus:outline-none focus:ring-0",
              "inline-flex items-center justify-center transition hover:scale-110 hover:bg-black/40",
              uiVisible ? "opacity-100" : "pointer-events-none opacity-0",
            ].join(" ")}
          >
            <NextImage src="/icons/Grid.svg" alt="" width={24} height={24} className="h-6 w-6 brightness-0 invert" />
          </button>
        ) : null}
      </motion.div>
    </div>
  );
}

type AlbumPhoto = {
  id: number;
  url: string;
  likesCount: number;
  likedByMe: boolean;
};

type AlbumDTO = {
  slug: string;
  title: string;
  photos: AlbumPhoto[];
};

type PhotoAlbumViewerProps = {
  slug: string;
  onBack: () => void;
};

export function PhotoAlbumViewer({ slug, onBack }: PhotoAlbumViewerProps) {
  const [album, setAlbum] = useState<AlbumDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/albums/${encodeURIComponent(slug)}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        const payload = (await response.json()) as { album?: AlbumDTO };
        setAlbum(payload.album ?? null);
      } catch (requestError) {
        if ((requestError as Error).name === "AbortError") return;
        setError("Failed to load photo album.");
      } finally {
        setLoading(false);
      }
    };

    void load();
    return () => controller.abort();
  }, [slug]);

  if (loading) {
    return <div className="p-4 text-sm text-white/70 md:rounded-2xl md:border md:border-white/10 md:bg-white/[0.03] md:p-5">Loading album...</div>;
  }

  if (error || !album) {
    return (
      <div className="p-4 text-sm text-white/70 md:rounded-2xl md:border md:border-white/10 md:bg-white/[0.03] md:p-5">
        <button type="button" onClick={onBack} className="mb-4 text-xs uppercase tracking-[0.18em] text-[#ffb16e]">
          ← Back
        </button>
        {error ?? "Album not found."}
      </div>
    );
  }

  return <PhotoSectionShell slug={album.slug} photos={album.photos} />;
}
