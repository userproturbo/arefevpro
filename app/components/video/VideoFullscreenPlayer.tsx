"use client";

import { useEffect, useRef } from "react";
import VideoViewer from "./VideoViewer";

type VideoFullscreenPlayerProps = {
  title: string;
  src?: string | null;
  embedUrl?: string | null;
  poster?: string | null;
  progressKey: string;
  onProgressChange?: (progress: number) => void;
};

type FullscreenVideoElement = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
};

export default function VideoFullscreenPlayer({
  title,
  src = null,
  embedUrl = null,
  poster = null,
  progressKey,
  onProgressChange,
}: VideoFullscreenPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!src) return;

    const player = videoRef.current;
    if (!player) return;

    const restoreProgress = () => {
      try {
        const saved = window.localStorage.getItem(progressKey);
        if (!saved) return;
        const nextTime = Number(saved);
        if (!Number.isFinite(nextTime) || nextTime <= 0) return;
        if (player.duration && nextTime >= player.duration) return;
        player.currentTime = nextTime;
      } catch (error) {
        console.error(error);
      }
    };

    const handleTimeUpdate = () => {
      if (!player.duration || !Number.isFinite(player.duration)) return;
      try {
        window.localStorage.setItem(progressKey, String(player.currentTime));
      } catch (error) {
        console.error(error);
      }
      onProgressChange?.(player.currentTime / player.duration);
    };

    const handleEnded = () => {
      try {
        window.localStorage.removeItem(progressKey);
      } catch (error) {
        console.error(error);
      }
      onProgressChange?.(1);
    };

    player.addEventListener("loadedmetadata", restoreProgress);
    player.addEventListener("timeupdate", handleTimeUpdate);
    player.addEventListener("ended", handleEnded);

    return () => {
      player.removeEventListener("loadedmetadata", restoreProgress);
      player.removeEventListener("timeupdate", handleTimeUpdate);
      player.removeEventListener("ended", handleEnded);
    };
  }, [onProgressChange, progressKey, src]);

  const enterFullscreen = async () => {
    if (embedUrl) return;

    const player = videoRef.current as FullscreenVideoElement | null;
    if (!player) return;

    if (document.fullscreenElement) return;

    if (typeof player.requestFullscreen === "function") {
      await player.requestFullscreen();
      return;
    }

    if (typeof player.webkitEnterFullscreen === "function") {
      player.webkitEnterFullscreen();
    }
  };

  if (embedUrl) {
    return (
      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black">
        <div className="aspect-video w-full">
          <iframe
            src={embedUrl}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </div>
    );
  }

  if (!src) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center rounded-[28px] border border-white/10 bg-black px-6 text-center text-sm text-white/70">
        Видео недоступно.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black">
      <VideoViewer
        ref={videoRef}
        src={src}
        title={title}
        poster={poster}
        autoPlay
        onClick={() => void enterFullscreen()}
        className="max-h-[60vh] w-full max-w-full rounded-none"
      />
    </div>
  );
}
