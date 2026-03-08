"use client";

import { useState, type TouchEvent as ReactTouchEvent } from "react";

const SWIPE_THRESHOLD = 44;
const DOUBLE_TAP_MS = 280;

type UsePhotoSwipeOptions = {
  onSwipeNext: () => void;
  onSwipePrev: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
};

export function usePhotoSwipe({ onSwipeNext, onSwipePrev, onSwipeUp, onSwipeDown }: UsePhotoSwipeOptions) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [pinchStart, setPinchStart] = useState<{ distance: number; zoom: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [lastTapAt, setLastTapAt] = useState(0);

  const getDistance = (
    first?: { clientX: number; clientY: number },
    second?: { clientX: number; clientY: number }
  ) => {
    if (!first || !second) return 0;
    return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
  };

  const onTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 2) {
      setPinchStart({ distance: getDistance(event.touches[0], event.touches[1]), zoom });
      return;
    }

    if (event.touches.length === 1) {
      const touch = event.touches[0];
      setTouchStart({ x: touch.clientX, y: touch.clientY });
    }
  };

  const onTouchMove = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 2 || !pinchStart) return;
    const distance = getDistance(event.touches[0], event.touches[1]);
    if (!distance || !pinchStart.distance) return;
    const nextZoom = Math.min(3, Math.max(1, (distance / pinchStart.distance) * pinchStart.zoom));
    setZoom(nextZoom);
  };

  const onTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (pinchStart && event.touches.length < 2) {
      setPinchStart(null);
      return;
    }

    if (!touchStart || zoom > 1.05) {
      setTouchStart(null);
      return;
    }

    const touch = event.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    setTouchStart(null);

    if (Math.abs(dx) >= SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) onSwipeNext();
      if (dx > 0) onSwipePrev();
      return;
    }

    if (Math.abs(dy) >= SWIPE_THRESHOLD && Math.abs(dy) > Math.abs(dx)) {
      if (dy < 0) onSwipeUp?.();
      if (dy > 0) onSwipeDown?.();
    }
  };

  const onDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapAt < DOUBLE_TAP_MS) {
      setZoom((prev) => (prev > 1 ? 1 : 2));
      setLastTapAt(0);
      return;
    }
    setLastTapAt(now);
  };

  return {
    zoom,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onDoubleTap,
  };
}
