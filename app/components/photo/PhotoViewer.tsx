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
    <div className="flex h-full w-full min-h-0 items-center justify-center px-0 py-0 sm:px-6 sm:py-6">
      <div className="relative inline-block max-h-full max-w-full">
        <motion.img
          key={activePhoto.id}
          src={activePhoto.url}
          alt=""
          className="block max-h-full max-w-full object-contain"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
        <PhotoLikeButton
          photoId={activeId}
          initialCount={likesCount}
          initialLiked={likedByMe}
          variant="overlay"
          className="absolute bottom-3 left-3 z-10 hidden sm:flex"
        />
      </div>
    </div>
  );
}
