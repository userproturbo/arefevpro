"use client";

import NextImage from "next/image";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
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
  onClose?: () => void;
  onNavigate?: (photoId: number) => void;
  showOverlayLike?: boolean;
};

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

  const swipe = usePhotoSwipe({ onSwipeNext: openNext, onSwipePrev: openPrev });

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
        <div
          className="relative w-full touch-pan-y select-none"
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
            className="block h-auto w-full object-contain md:max-h-[72vh] md:w-auto md:max-w-full"
          />
        </div>
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

  return <PhotoSectionShell slug={album.slug} title={album.title} photos={album.photos} onBack={onBack} />;
}
