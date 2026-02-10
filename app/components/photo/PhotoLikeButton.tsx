"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/providers";
import { usePhotoLikesStore } from "./photoLikesStore";

type Props = {
  photoId: number;
  initialCount: number;
  initialLiked?: boolean;
  size?: "sm" | "md";
  variant?: "default" | "overlay";
  className?: string;
};

export default function PhotoLikeButton({
  photoId,
  initialCount,
  initialLiked = false,
  size = "md",
  variant = "default",
  className,
}: Props) {
  const { requireUser, user } = useAuth();
  const likeState = usePhotoLikesStore((state) => state.byId[photoId]);
  const ensurePhoto = usePhotoLikesStore((state) => state.ensurePhoto);
  const optimisticToggle = usePhotoLikesStore((state) => state.optimisticToggle);
  const applyServerState = usePhotoLikesStore((state) => state.applyServerState);
  const rollback = usePhotoLikesStore((state) => state.rollback);

  const liked = likeState?.liked ?? initialLiked;
  const count = likeState?.likesCount ?? initialCount;
  const loading = likeState?.pending ?? false;
  const [animateLike, setAnimateLike] = useState(false);
  const prevLikedRef = useRef(liked);
  const animationTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    ensurePhoto(photoId, initialLiked, initialCount);
  }, [ensurePhoto, initialCount, initialLiked, photoId]);

  useEffect(() => {
    const prevLiked = prevLikedRef.current;
    if (!prevLiked && liked) {
      setAnimateLike(true);
      if (animationTimeoutRef.current) {
        window.clearTimeout(animationTimeoutRef.current);
      }
      animationTimeoutRef.current = window.setTimeout(() => {
        setAnimateLike(false);
        animationTimeoutRef.current = null;
      }, 420);
    }
    prevLikedRef.current = liked;
  }, [liked]);

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        window.clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  const toggleLike = async () => {
    if (loading) return;
    await requireUser(async () => {
      const snapshot = optimisticToggle(photoId);
      try {
        const res = await fetch(`/api/photos/${photoId}/like`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) throw new Error("like failed");
        const data = (await res.json()) as { liked?: unknown; likesCount?: unknown };
        applyServerState(
          photoId,
          typeof data.liked === "boolean" ? data.liked : undefined,
          typeof data.likesCount === "number" ? data.likesCount : undefined
        );
      } catch (error) {
        console.error(error);
        rollback(photoId, snapshot);
      }
    });
  };

  const sizeClasses =
    size === "sm"
      ? "px-2.5 py-1 text-[0.7rem]"
      : "px-3 py-1.5 text-sm";

  const isOverlay = variant === "overlay";
  const stateClasses = isOverlay
    ? "bg-transparent border-transparent text-white/90"
    : liked
      ? "bg-black/60 border-white/40 text-white"
      : "bg-black/55 border-white/20 text-white/90 hover:bg-white/10";

  const baseClasses = [
    "inline-flex items-center gap-1.5 rounded-full border font-semibold transition",
    isOverlay ? "" : "backdrop-blur",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      onClick={toggleLike}
      disabled={loading}
      aria-pressed={liked}
      className={[
        baseClasses,
        sizeClasses,
        stateClasses,
        loading ? "cursor-wait opacity-70" : "",
        !user ? "opacity-80" : "",
        className ?? "",
      ].join(" ")}
    >
      <span className="photo-like-heart">
        <span className="photo-like-heart__grid" aria-hidden="true">
          <span className="photo-like-heart__pixel" />
          <span className="photo-like-heart__pixel" />
          <span className="photo-like-heart__pixel" />
          <span className="photo-like-heart__pixel" />
          <span className="photo-like-heart__pixel" />
          <span className="photo-like-heart__pixel" />
          <span className="photo-like-heart__pixel" />
          <span className="photo-like-heart__pixel" />
          <span className="photo-like-heart__pixel" />
          <span className="photo-like-heart__pixel" />
          <span className="photo-like-heart__pixel" />
          <span className="photo-like-heart__pixel" />
          <span className="photo-like-heart__pixel" />
          <span className="photo-like-heart__pixel" />
          <span className="photo-like-heart__pixel" />
          <span className="photo-like-heart__pixel" />
          <span className="photo-like-heart__pixel" />
          <span className="photo-like-heart__pixel" />
          <span className="photo-like-heart__pixel" />
          <span className="photo-like-heart__pixel" />
        </span>
        <span
          aria-hidden="true"
          className={[
            "photo-like-heart__scan",
            animateLike ? "photo-like-heart__scan--active" : "",
          ].join(" ")}
        >
          <span className="photo-like-heart__grid">
            <span className="photo-like-heart__pixel" />
            <span className="photo-like-heart__pixel" />
            <span className="photo-like-heart__pixel" />
            <span className="photo-like-heart__pixel" />
            <span className="photo-like-heart__pixel" />
            <span className="photo-like-heart__pixel" />
            <span className="photo-like-heart__pixel" />
            <span className="photo-like-heart__pixel" />
            <span className="photo-like-heart__pixel" />
            <span className="photo-like-heart__pixel" />
            <span className="photo-like-heart__pixel" />
            <span className="photo-like-heart__pixel" />
            <span className="photo-like-heart__pixel" />
            <span className="photo-like-heart__pixel" />
            <span className="photo-like-heart__pixel" />
            <span className="photo-like-heart__pixel" />
            <span className="photo-like-heart__pixel" />
            <span className="photo-like-heart__pixel" />
            <span className="photo-like-heart__pixel" />
            <span className="photo-like-heart__pixel" />
          </span>
        </span>
      </span>
      <span className={isOverlay ? "text-white/90" : "text-white/90"}>
        {count}
      </span>
    </button>
  );
}
