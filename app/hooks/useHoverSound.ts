"use client";

import { useCallback, useEffect, useRef } from "react";

type HoverSoundOptions = {
  src: string;
  volume?: number;
};

export function useHoverSound({ src, volume = 0.3 }: HoverSoundOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio(src);
    audio.preload = "auto";
    audio.volume = volume;
    audioRef.current = audio;

    return () => {
      audioRef.current = null;
    };
  }, [src, volume]);

  return useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (typeof window !== "undefined") {
      const canHover = window.matchMedia?.("(hover: hover)")?.matches;
      if (canHover === false) return;
    }

    try {
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch(() => {
          // Ignore autoplay restrictions or transient play errors.
        });
      }
    } catch {
      // Ignore playback errors to keep hover interactions smooth.
    }
  }, []);
}
