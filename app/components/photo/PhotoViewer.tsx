"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import PhotoLikeButton from "./PhotoLikeButton";

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
};

export default function PhotoViewer({
  slug,
  photos,
  activeId,
  likesCount,
  likedByMe,
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
      const image = new Image();
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
        router.push(`/photo/${encodedSlug}`, { scroll: false });
        return;
      }

      if (event.key === "ArrowLeft" && prevPhoto) {
        event.preventDefault();
        router.replace(`/photo/${encodedSlug}/${prevPhoto.id}`, { scroll: false });
      }

      if (event.key === "ArrowRight" && nextPhoto) {
        event.preventDefault();
        router.replace(`/photo/${encodedSlug}/${nextPhoto.id}`, { scroll: false });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [encodedSlug, nextPhoto, prevPhoto, router]);

  if (!activePhoto) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-white/70">
        Photo not found.
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="relative flex flex-1 min-h-0 items-center justify-center px-6 py-6">
        <motion.img
          key={activePhoto.id}
          src={activePhoto.url}
          alt=""
          className="max-h-full max-w-full object-contain"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
        <PhotoLikeButton
          photoId={activeId}
          initialCount={likesCount}
          initialLiked={likedByMe}
          variant="overlay"
          className="absolute bottom-6 left-6 z-10"
        />
      </div>

      <div className="shrink-0 border-t border-white/10 bg-black/30 h-28">
        <div className="flex h-full items-center gap-3 overflow-x-auto p-3 no-scrollbar">
          {photos.map((photo) => {
            const isActive = photo.id === activeId;
            return (
              <button
                key={photo.id}
                type="button"
                onClick={() => {
                  if (isActive) return;
                  router.replace(`/photo/${encodedSlug}/${photo.id}`, {
                    scroll: false,
                  });
                }}
                className="shrink-0"
                aria-pressed={isActive}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt=""
                  loading="lazy"
                  className={`h-24 w-24 object-cover transition ${
                    isActive
                      ? "ring-2 ring-emerald-400"
                      : "opacity-70 hover:opacity-100"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
