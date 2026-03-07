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
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
    };
  }, [src, volume]);

  const play = useCallback(() => {
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

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
  }, []);

  const reset = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
  }, []);

  const stopAndReset = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
  }, []);

  return { play, stop, reset, stopAndReset };
}
