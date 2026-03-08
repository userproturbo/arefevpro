"use client";

import NextImage from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState, type TouchEvent as ReactTouchEvent } from "react";
import { useRouter } from "next/navigation";
import PhotoLikeButton from "./PhotoLikeButton";
import PhotoComments from "@/app/components/comments/PhotoComments";

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
  onClose?: () => void;
  onNavigate?: (photoId: number) => void;
  showOverlayLike?: boolean;
};

const SWIPE_THRESHOLD = 44;
const DOUBLE_TAP_MS = 280;

export default function PhotoViewer({
  slug,
  photos,
  activeId,
  likesCount,
  likedByMe,
  onClose,
  onNavigate,
  showOverlayLike = true,
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
        if (onNavigate) {
          onNavigate(prevPhoto.id);
        } else {
          router.replace(`/photo/${encodedSlug}/${prevPhoto.id}`, { scroll: false });
        }
      }

      if (event.key === "ArrowRight" && nextPhoto) {
        event.preventDefault();
        if (onNavigate) {
          onNavigate(nextPhoto.id);
        } else {
          router.replace(`/photo/${encodedSlug}/${nextPhoto.id}`, { scroll: false });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [encodedSlug, nextPhoto, onClose, onNavigate, prevPhoto, router]);

  const openPrev = () => {
    if (!prevPhoto) return;
    if (onNavigate) {
      onNavigate(prevPhoto.id);
      return;
    }
    router.replace(`/photo/${encodedSlug}/${prevPhoto.id}`, { scroll: false });
  };

  const openNext = () => {
    if (!nextPhoto) return;
    if (onNavigate) {
      onNavigate(nextPhoto.id);
      return;
    }
    router.replace(`/photo/${encodedSlug}/${nextPhoto.id}`, { scroll: false });
  };

  if (!activePhoto) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-white/70">
        Photo not found.
      </div>
    );
  }

  return (
    <div className="flex h-full w-full min-h-0 items-center justify-center px-0 py-0 md:px-6 md:py-6">
      <motion.div
        key={activePhoto.id}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-full overflow-hidden md:inline-block md:max-h-full md:w-auto md:max-w-full"
      >
        <ZoomablePhotoFrame photo={activePhoto} onSwipeNext={openNext} onSwipePrev={openPrev} />
        {showOverlayLike ? (
          <PhotoLikeButton
            photoId={activeId}
            initialCount={likesCount}
            initialLiked={likedByMe}
            variant="overlay"
            className="absolute bottom-3 left-3 z-10 hidden sm:flex"
          />
        ) : null}
      </motion.div>
    </div>
  );
}

function ZoomablePhotoFrame({
  photo,
  onSwipeNext,
  onSwipePrev,
}: {
  photo: PhotoItem;
  onSwipeNext: () => void;
  onSwipePrev: () => void;
}) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [pinchStart, setPinchStart] = useState<{ distance: number; zoom: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [lastTapAt, setLastTapAt] = useState<number>(0);

  const getDistance = (
    first?: { clientX: number; clientY: number },
    second?: { clientX: number; clientY: number }
  ) => {
    if (!first || !second) return 0;
    return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
  };

  const onTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 2) {
      setPinchStart({ distance: getDistance(event.touches[0], event.touches[1]), zoom });
      return;
    }
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
    }
  };

  const onTouchMove = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 2 || !pinchStart) return;
    const distance = getDistance(event.touches[0], event.touches[1]);
    if (!distance || !pinchStart.distance) return;
    const nextZoom = Math.min(3, Math.max(1, (distance / pinchStart.distance) * pinchStart.zoom));
    setZoom(nextZoom);
  };

  const onTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (pinchStart && event.touches.length < 2) {
      setPinchStart(null);
      return;
    }
    if (!touchStart || zoom > 1.05) {
      setTouchStart(null);
      return;
    }
    const touch = event.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    setTouchStart(null);
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) onSwipeNext();
    if (dx > 0) onSwipePrev();
  };

  const onDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapAt < DOUBLE_TAP_MS) {
      setZoom((prev) => (prev > 1 ? 1 : 2));
      setLastTapAt(0);
      return;
    }
    setLastTapAt(now);
  };

  return (
    <div
      className="relative w-full touch-pan-y select-none"
      onClick={onDoubleTap}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ transform: `scale(${zoom})`, transformOrigin: "center center", transition: "transform 180ms ease-out" }}
    >
      <NextImage
        src={photo.url}
        alt=""
        width={1800}
        height={1200}
        priority
        className="block h-auto w-full object-contain md:max-h-[72vh] md:w-auto md:max-w-full"
      />
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
  const [activePhotoId, setActivePhotoId] = useState<number | null>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
        setActivePhotoId(null);
        setCommentsOpen(false);
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 767.98px)");
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!commentsOpen || !isMobile) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [commentsOpen, isMobile]);

  const activeIndex = useMemo(() => {
    if (!album || !activePhotoId) return -1;
    return album.photos.findIndex((photo) => photo.id === activePhotoId);
  }, [activePhotoId, album]);

  useEffect(() => {
    if (!album || activeIndex < 0) return;
    const neighbors = [album.photos[activeIndex - 1], album.photos[activeIndex + 1]].filter(
      (photo): photo is AlbumPhoto => Boolean(photo)
    );
    neighbors.forEach((photo) => {
      const image = new window.Image();
      image.src = photo.url;
    });
  }, [activeIndex, album]);

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

  const activePhoto = activeIndex >= 0 ? album.photos[activeIndex] : null;
  const prevPhoto = activeIndex > 0 ? album.photos[activeIndex - 1] : null;
  const nextPhoto =
    activeIndex >= 0 && activeIndex < album.photos.length - 1 ? album.photos[activeIndex + 1] : null;

  return (
    <div className="w-full md:rounded-2xl md:border md:border-white/10 md:bg-white/[0.03] md:p-6">
      <div className="px-4 pb-4 pt-4 md:px-0 md:pt-0">
        <button type="button" onClick={onBack} className="text-xs uppercase tracking-[0.18em] text-[#ffb16e]">
          ← Back
        </button>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-white">{album.title}</h1>
      </div>

      <AnimatePresence mode="wait">
        {activePhoto ? (
          <motion.div
            key={`viewer-${activePhoto.id}`}
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="pb-4 md:pb-0"
          >
            <button
              type="button"
              onClick={() => {
                setActivePhotoId(null);
                setCommentsOpen(false);
              }}
              className="mb-3 px-4 text-xs uppercase tracking-[0.18em] text-white/65 hover:text-white md:px-0"
            >
              ← Back to grid
            </button>
            <div className="h-[56vh] min-h-[300px] w-full border-y border-white/10 bg-black/35 md:h-[62vh] md:rounded-xl md:border">
              <PhotoViewer
                slug={album.slug}
                photos={album.photos.map((photo) => ({ id: photo.id, url: photo.url }))}
                activeId={activePhoto.id}
                likesCount={activePhoto.likesCount}
                likedByMe={activePhoto.likedByMe}
                onClose={() => {
                  setActivePhotoId(null);
                  setCommentsOpen(false);
                }}
                onNavigate={(photoId) => {
                  setActivePhotoId(photoId);
                  setCommentsOpen(false);
                }}
                showOverlayLike={false}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-4 md:px-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => prevPhoto && setActivePhotoId(prevPhoto.id)}
                  disabled={!prevPhoto}
                  className="rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/80 hover:bg-black/70 disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => nextPhoto && setActivePhotoId(nextPhoto.id)}
                  disabled={!nextPhoto}
                  className="rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/80 hover:bg-black/70 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
              <div className="flex items-center gap-2">
                <PhotoLikeButton
                  photoId={activePhoto.id}
                  initialCount={activePhoto.likesCount}
                  initialLiked={activePhoto.likedByMe}
                  size="sm"
                />
                <button
                  type="button"
                  onClick={() => setCommentsOpen((prev) => !prev)}
                  className="rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-xs font-semibold text-white/90 hover:bg-black/70"
                >
                  💬 Comments
                </button>
              </div>
            </div>

            {commentsOpen ? (
              <div className="mt-4 hidden rounded-xl border border-white/10 bg-black/25 p-4 md:block">
                <PhotoComments photoId={activePhoto.id} />
              </div>
            ) : null}

            {commentsOpen && isMobile ? (
              <>
                <button
                  type="button"
                  aria-label="Close comments drawer"
                  onClick={() => setCommentsOpen(false)}
                  className="fixed inset-0 z-40 bg-black/65 md:hidden"
                />
                <div className="fixed inset-x-0 bottom-0 z-50 max-h-[72vh] rounded-t-2xl border border-white/15 bg-[#0f1218] p-4 md:hidden">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-white">Comments</p>
                    <button
                      type="button"
                      onClick={() => setCommentsOpen(false)}
                      className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/80"
                    >
                      Close
                    </button>
                  </div>
                  <div className="max-h-[58vh] overflow-y-auto pr-1">
                    <PhotoComments photoId={activePhoto.id} />
                  </div>
                </div>
              </>
            ) : null}
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0, scale: 0.995 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.995 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-2 gap-2.5 px-4 pb-4 md:gap-3 md:px-0 md:pb-0 lg:gap-4 lg:grid-cols-4 md:grid-cols-3"
          >
            {album.photos.map((photo) => (
              <button
                type="button"
                key={photo.id}
                onClick={() => setActivePhotoId(photo.id)}
                className="group relative block overflow-hidden rounded-lg"
                aria-label={`Open photo ${photo.id}`}
              >
                <NextImage
                  src={photo.url}
                  alt=""
                  fill
                  sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
                  loading="lazy"
                  className="object-cover transition duration-200 group-hover:scale-[1.02] group-hover:brightness-110"
                />
                <span className="block aspect-square" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
