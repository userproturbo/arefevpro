"use client";

import { useCallback, useRef } from "react";

type SwipeDecision = "next" | "prev" | "none";
type TapResult = "single" | "double";
type TouchPointLike = { clientX: number; clientY: number };

export function usePhotoGestures() {
  const pinchStartDistanceRef = useRef<number | null>(null);
  const pinchStartScaleRef = useRef(1);
  const lastTapAt = useRef(0);
  const tapTimeout = useRef<number | null>(null);

  const getTouchDistance = useCallback((touches: ArrayLike<TouchPointLike>) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const resolveSwipe = useCallback((deltaX: number, velocity: number, distanceThreshold = 80, velocityThreshold = 0.6): SwipeDecision => {
    if (deltaX < -distanceThreshold || velocity < -velocityThreshold) return "next";
    if (deltaX > distanceThreshold || velocity > velocityThreshold) return "prev";
    return "none";
  }, []);

  const resetPinch = useCallback(() => {
    pinchStartDistanceRef.current = null;
    pinchStartScaleRef.current = 1;
  }, []);

  const registerTap = useCallback((doubleTapWindowMs = 260): TapResult => {
    const now = Date.now();
    if (now - lastTapAt.current < doubleTapWindowMs) {
      lastTapAt.current = 0;
      if (tapTimeout.current) {
        window.clearTimeout(tapTimeout.current);
        tapTimeout.current = null;
      }
      return "double";
    }

    lastTapAt.current = now;
    return "single";
  }, []);

  const scheduleSingleTap = useCallback((fn: () => void, delayMs = 220) => {
    if (tapTimeout.current) {
      window.clearTimeout(tapTimeout.current);
    }
    tapTimeout.current = window.setTimeout(() => {
      tapTimeout.current = null;
      fn();
    }, delayMs);
  }, []);

  const clearTapTimers = useCallback(() => {
    if (tapTimeout.current) {
      window.clearTimeout(tapTimeout.current);
      tapTimeout.current = null;
    }
    lastTapAt.current = 0;
  }, []);

  const rubberBand = useCallback((distance: number, factor = 0.55) => {
    return distance > 0 ? distance * factor : distance;
  }, []);

  return {
    pinchStartDistanceRef,
    pinchStartScaleRef,
    getTouchDistance,
    resolveSwipe,
    resetPinch,
    registerTap,
    scheduleSingleTap,
    clearTapTimers,
    rubberBand,
  };
}
