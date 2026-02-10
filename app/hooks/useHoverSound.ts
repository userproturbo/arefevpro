"use client";

import { useCallback, useEffect } from "react";

type HoverSoundOptions = {
  src: string;
  volume?: number;
};

let sharedAudio: HTMLAudioElement | null = null;
let sharedSrc = "";
let sharedVolume = 0.3;
let listenersAttached = false;
let activeHookCount = 0;
let audioUnlocked = false;
let unlockInProgress = false;

const INTERACTIVE_SELECTOR =
  "button,[role=\"button\"],[role=\"link\"],a[href],input[type=\"button\"],input[type=\"submit\"],input[type=\"reset\"],summary";

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return !!target.closest(INTERACTIVE_SELECTOR);
}

function ensureAudio(src: string, volume: number) {
  if (!sharedAudio || sharedSrc !== src) {
    sharedAudio = new Audio(src);
    sharedAudio.preload = "auto";
    sharedSrc = src;
  }
  if (sharedVolume !== volume) {
    sharedVolume = volume;
  }
  sharedAudio.volume = sharedVolume;
}

function safePlay() {
  const audio = sharedAudio;
  if (!audio) return;

  try {
    audio.currentTime = 0;
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch(() => {
        // Ignore autoplay restrictions or transient play errors.
      });
    }
  } catch {
    // Ignore playback errors to keep UI interactions smooth.
  }
}

function unlockAudioIfNeeded() {
  const audio = sharedAudio;
  if (!audio || audioUnlocked || unlockInProgress) return;

  unlockInProgress = true;
  const previousMuted = audio.muted;
  const previousVolume = audio.volume;
  audio.muted = true;
  audio.volume = 0;

  const playPromise = audio.play();
  if (playPromise) {
    playPromise
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = previousMuted;
        audio.volume = previousVolume;
        audioUnlocked = true;
      })
      .catch(() => {
        audio.muted = previousMuted;
        audio.volume = previousVolume;
        audioUnlocked = false;
      })
      .finally(() => {
        unlockInProgress = false;
      });
  } else {
    audio.muted = previousMuted;
    audio.volume = previousVolume;
    unlockInProgress = false;
  }
}

function handlePointerDown(event: PointerEvent) {
  unlockAudioIfNeeded();

  if (event.pointerType === "mouse") return;
  if (!isInteractiveTarget(event.target)) return;
  safePlay();
}

function attachGlobalListeners() {
  if (listenersAttached || typeof document === "undefined") return;
  document.addEventListener("pointerdown", handlePointerDown, { capture: true });
  listenersAttached = true;
}

function detachGlobalListeners() {
  if (!listenersAttached || typeof document === "undefined") return;
  document.removeEventListener("pointerdown", handlePointerDown, { capture: true });
  listenersAttached = false;
}

export function useHoverSound({ src, volume = 0.3 }: HoverSoundOptions) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    ensureAudio(src, volume);
    activeHookCount += 1;
    if (activeHookCount === 1) {
      attachGlobalListeners();
    }

    return () => {
      activeHookCount = Math.max(0, activeHookCount - 1);
      if (activeHookCount === 0) {
        detachGlobalListeners();
      }
    };
  }, [src, volume]);

  return useCallback((event?: { type?: string; pointerType?: string }) => {
    if (typeof window === "undefined") return;

    if (event?.type === "pointerenter") {
      if (event.pointerType !== "mouse") return;
      safePlay();
      return;
    }

    if (event?.type === "pointerdown") {
      if (event.pointerType === "mouse") return;
      unlockAudioIfNeeded();
      safePlay();
      return;
    }

    const canHover = window.matchMedia?.("(hover: hover)")?.matches;
    if (canHover === false) return;
    safePlay();
  }, []);
}
