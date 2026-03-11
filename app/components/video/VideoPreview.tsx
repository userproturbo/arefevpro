"use client";

import { useRef, useState } from "react";

type VideoPreviewProps = {
  title: string;
  thumbnailUrl: string;
  previewSrc?: string | null;
  previewActive: boolean;
  canHover: boolean;
  onOpen: () => void;
  onPreviewRequest: () => void;
};

export default function VideoPreview({
  title,
  thumbnailUrl,
  previewSrc = null,
  previewActive,
  canHover,
  onOpen,
  onPreviewRequest,
}: VideoPreviewProps) {
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const [hoverPlaying, setHoverPlaying] = useState(false);
  const shouldRenderPreview = Boolean(previewSrc && (previewActive || hoverPlaying));

  const playPreview = async () => {
    if (!previewSrc) return;

    if (!previewActive) {
      onPreviewRequest();
    }

    const player = previewRef.current;
    if (!player) return;

    try {
      player.currentTime = 0;
      await player.play();
      setHoverPlaying(true);
    } catch {
      setHoverPlaying(false);
    }
  };

  const stopPreview = () => {
    const player = previewRef.current;
    if (!player) return;

    player.pause();
    player.currentTime = 0;
    setHoverPlaying(false);
  };

  const handleCardClick = () => {
    if (canHover) {
      onOpen();
      return;
    }

    if (!previewActive) {
      onPreviewRequest();
      window.setTimeout(() => {
        void playPreview();
      }, 0);
      return;
    }

    onOpen();
  };

  return (
    <button
      type="button"
      onClick={handleCardClick}
      onMouseEnter={() => {
        if (!canHover) return;
        void playPreview();
      }}
      onMouseLeave={() => {
        if (!canHover) return;
        stopPreview();
      }}
      onFocus={() => {
        if (!canHover) return;
        void playPreview();
      }}
      onBlur={() => {
        if (!canHover) return;
        stopPreview();
      }}
      className="group relative block aspect-video w-full overflow-hidden rounded-[24px] bg-black text-left"
      aria-label={previewActive ? `Открыть видео ${title}` : `Предпросмотр видео ${title}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumbnailUrl}
        alt={title}
        className={[
          "h-full w-full object-cover transition duration-300",
          hoverPlaying || previewActive ? "scale-[1.02] opacity-20" : "opacity-100 group-hover:scale-[1.03]",
        ].join(" ")}
      />

      {shouldRenderPreview ? (
        <video
          ref={previewRef}
          src={previewSrc ?? undefined}
          poster={thumbnailUrl}
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{title}</p>
          <p className="mt-1 text-[0.65rem] uppercase tracking-[0.22em] text-white/55">
            {previewActive && !canHover ? "Tap again to open" : "Preview ready"}
          </p>
        </div>
        {!canHover ? (
          <span className="inline-flex rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-white/90">
            {previewActive ? "Open" : "Preview"}
          </span>
        ) : (
          <span className="inline-flex rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-white/90">
            Play
          </span>
        )}
      </div>
    </button>
  );
}
