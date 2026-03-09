"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/providers";
import { photoLikesStore, usePhotoLikesStore } from "./photoLikesStore";

type Props = {
  photoId: number;
  initialCount: number;
  initialLiked?: boolean;
  size?: "sm" | "md";
  variant?: "default" | "overlay";
  className?: string;
  iconOnly?: boolean;
  iconSrc?: string;
  iconAlt?: string;
};

export default function PhotoLikeButton({
  photoId,
  initialCount,
  initialLiked = false,
  size = "md",
  variant = "default",
  className,
  iconOnly = false,
  iconSrc,
  iconAlt = "like",
}: Props) {
  const { requireUser, user } = useAuth();
  const likeState = usePhotoLikesStore((state) => state.byId[photoId]);
  const ensurePhoto = usePhotoLikesStore((state) => state.ensurePhoto);

  const liked = likeState?.liked ?? initialLiked;
  const count = likeState?.likesCount ?? initialCount;
  const storePending = likeState?.pending ?? false;
  const [requestPending, setRequestPending] = useState(false);
  const loading = storePending || requestPending;
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
      setRequestPending(true);
      try {
        const res = await fetch(`/api/photos/${photoId}/like`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) throw new Error("like failed");
        photoLikesStore.toggle(photoId);
      } catch (error) {
        console.error(error);
      } finally {
        setRequestPending(false);
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

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={toggleLike}
        disabled={loading}
        aria-pressed={liked}
        aria-label={`${liked ? "Unlike" : "Like"} photo`}
        className={[
          "inline-flex h-7 w-7 items-center justify-center bg-transparent text-white transition active:scale-90",
          loading ? "cursor-wait opacity-70" : "opacity-80 hover:opacity-100",
          className ?? "",
        ].join(" ")}
      >
        {iconSrc ? (
          <Image
            src={iconSrc}
            alt={iconAlt}
            width={28}
            height={28}
            className={[
              "w-7 h-7 transition",
              liked
                ? "brightness-0 invert text-orange-400 scale-110 drop-shadow-[0_0_8px_rgba(255,120,0,0.6)]"
                : "brightness-0 invert opacity-70 hover:opacity-100",
            ].join(" ")}
          />
        ) : (
          <span className="text-sm leading-none">{liked ? "♥" : "♡"}</span>
        )}
      </button>
    );
  }

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
