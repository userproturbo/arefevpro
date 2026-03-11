"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { photoStore, usePhotoStore } from "./photoStore";

type PhotoControlsProps = {
  photoId: number;
  onBackToGrid: () => void;
  onToggleComments: () => void;
  currentIndex: number;
  totalPhotos: number;
  commentsOpen: boolean;
  className?: string;
  style?: CSSProperties;
  controlBarStyle?: CSSProperties;
};

export default function PhotoControls({
  photoId,
  onBackToGrid,
  onToggleComments,
  currentIndex,
  totalPhotos,
  commentsOpen,
  className,
  style,
  controlBarStyle,
}: PhotoControlsProps) {
  const photo = photoStore.usePhoto(photoId);
  const [likeTapped, setLikeTapped] = useState(false);
  const likeTapTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (likeTapTimeoutRef.current) {
        window.clearTimeout(likeTapTimeoutRef.current);
      }
    };
  }, []);

  const onLike = async () => {
    const previous = usePhotoStore.getState().photos[photoId] ?? photo;
    photoStore.toggleLike(photoId);

    try {
      const response = await fetch(`/api/photos/${photoId}/like`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }
    } catch {
      photoStore.setPhoto(photoId, previous);
    } finally {
      setLikeTapped(true);
      if (likeTapTimeoutRef.current) {
        window.clearTimeout(likeTapTimeoutRef.current);
      }
      likeTapTimeoutRef.current = window.setTimeout(() => {
        setLikeTapped(false);
      }, 300);
    }
  };

  return (
    <div className={["pointer-events-none absolute inset-0 z-30", className ?? ""].join(" ")} style={style}>
      <div className="absolute left-6 top-20 hidden flex-col gap-6 md:flex">
        <button
          type="button"
          onClick={onBackToGrid}
          aria-label="Back to grid"
          className="pointer-events-auto h-7 w-7 cursor-pointer"
        >
          <Image
            src="/icons/Grid.svg"
            alt="grid"
            width={28}
            height={28}
            className="w-7 h-7 brightness-0 invert opacity-80 hover:opacity-100 transition"
          />
        </button>

        <button
          type="button"
          onClick={onLike}
          aria-label={photo.likedByMe ? "Unlike photo" : "Like photo"}
          className="pointer-events-auto inline-flex items-center gap-2 cursor-pointer"
        >
          <Image
            src="/icons/Fire.svg"
            alt="like"
            width={28}
            height={28}
            className={[
              "w-7 h-7 brightness-0 invert transition active:scale-90",
              photo.likedByMe
                ? "scale-110 opacity-100 drop-shadow-[0_0_8px_rgba(255,120,0,0.6)]"
                : "opacity-70 hover:opacity-100",
            ].join(" ")}
          />
          <span className="min-w-[18px] text-left text-xs text-white/70 transition-all duration-200">
            {photo.likesCount > 0 ? photo.likesCount : ""}
          </span>
        </button>

        <button
          type="button"
          onClick={onToggleComments}
          aria-label="Open comments"
          className="pointer-events-auto inline-flex items-center gap-2 cursor-pointer"
        >
          <Image
            src="/icons/CommentAlt.svg"
            alt="comments"
            width={28}
            height={28}
            className="w-7 h-7 brightness-0 invert opacity-80 hover:opacity-100 transition"
          />
          {photo.commentsCount > 0 ? (
            <span className="text-xs text-white/70">{photo.commentsCount}</span>
          ) : null}
        </button>
      </div>

      <div className="pointer-events-auto md:hidden">
        <div className="pointer-events-none absolute left-0 right-0 top-4 flex items-center justify-center">
          <div className="pointer-events-auto rounded-full bg-black/50 px-4 py-2 text-sm text-white backdrop-blur">
            {currentIndex} / {totalPhotos}
          </div>
        </div>

        <div
          className="absolute bottom-[calc(32px+env(safe-area-inset-bottom))] left-1/2 flex min-w-[260px] -translate-x-1/2 items-center justify-center rounded-full bg-transparent px-[22px] py-[14px] pr-16"
          style={controlBarStyle}
        >
          <div className="flex items-center gap-7">
            <button
              type="button"
              onClick={onBackToGrid}
              aria-label="Open grid"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 px-1 text-[18px] text-white opacity-90 transition-all duration-150 active:scale-90 active:opacity-100 hover:opacity-100"
            >
              <Image
                src="/icons/Grid.svg"
                alt="grid"
                width={26}
                height={26}
                className="h-[26px] w-[26px] brightness-0 invert opacity-90"
              />
            </button>

            <button
              type="button"
              onClick={onLike}
              aria-label={photo.likedByMe ? "Unlike photo" : "Like photo"}
              className={[
                "group inline-flex min-h-[44px] items-center justify-center gap-2 px-1 text-sm text-white opacity-90 transition-all duration-150 active:opacity-100 hover:opacity-100",
                photo.likedByMe ? "scale-105" : "",
              ].join(" ")}
            >
              <span
                className={[
                  "inline-flex transition-all duration-150 group-active:scale-90",
                  likeTapped ? "drop-shadow-[0_0_12px_rgba(255,120,60,0.35)]" : "",
                ].join(" ")}
              >
                <Image
                  src="/icons/Fire.svg"
                  alt="like"
                  width={26}
                  height={26}
                  className={[
                    "h-[26px] w-[26px] brightness-0 invert transition-all duration-150",
                    photo.likedByMe
                      ? "scale-110 opacity-100 drop-shadow-[0_0_10px_rgba(255,120,0,0.75)]"
                      : "opacity-80",
                  ].join(" ")}
                />
              </span>
              {photo.likesCount > 0 ? <span className="text-sm opacity-90">{photo.likesCount}</span> : null}
            </button>

            <button
              type="button"
              onClick={onToggleComments}
              aria-label="Open comments"
              className={[
                "inline-flex min-h-[44px] items-center justify-center gap-2 px-1 text-[18px] text-white opacity-90 transition-all duration-150 active:scale-90 active:opacity-100 hover:opacity-100",
                commentsOpen ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.28)]" : "",
              ].join(" ")}
            >
              <Image
                src="/icons/CommentAlt.svg"
                alt="comments"
                width={26}
                height={26}
                className="h-[26px] w-[26px] brightness-0 invert opacity-90"
              />
              {photo.commentsCount > 0 ? <span className="text-sm opacity-90">{photo.commentsCount}</span> : null}
            </button>
          </div>

          <button
            type="button"
            onClick={onBackToGrid}
            aria-label="Close viewer"
            className="absolute right-4 inline-flex min-h-[44px] items-center justify-center text-white opacity-90 transition-all duration-150 active:scale-90 active:opacity-100 hover:opacity-100"
          >
            <span className="text-[26px] leading-none">✕</span>
          </button>
        </div>
      </div>
    </div>
  );
}
