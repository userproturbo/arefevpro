"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type CharacterMotionOptions = {
  initialProgress?: number;
  intentDelayMs?: number;
  microMotionProgress?: number;
  enterSpeed?: number;
  leaveSpeed?: number;
  stableEpsilon?: number;
  entryDurationMs?: number;
};

type StartIdleOptions = {
  withEntry?: boolean;
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start: number, end: number, factor: number) {
  return start + (end - start) * factor;
}

export default function useCharacterMotion({
  initialProgress = 0,
  intentDelayMs = 0,
  microMotionProgress = 0,
  enterSpeed = 0.12,
  leaveSpeed = 0.1,
  stableEpsilon = 0.001,
  entryDurationMs = 0,
}: CharacterMotionOptions = {}) {
  const [progress, setProgress] = useState(initialProgress);
  const [entryProgress, setEntryProgress] = useState(0);
  const [idleElapsedMs, setIdleElapsedMs] = useState(0);

  const frameRef = useRef<number | null>(null);
  const intentTimerRef = useRef<number | null>(null);
  const progressRef = useRef(initialProgress);
  const targetRef = useRef(initialProgress);
  const idleActiveRef = useRef(false);
  const idleStartedAtRef = useRef<number | null>(null);
  const entryActiveRef = useRef(false);
  const entryStartedAtRef = useRef<number | null>(null);
  const tickRef = useRef<(time: number) => void>(() => {});

  const cancelIntent = useCallback(() => {
    if (intentTimerRef.current !== null) {
      window.clearTimeout(intentTimerRef.current);
      intentTimerRef.current = null;
    }
  }, []);

  const stopFrame = useCallback(() => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  useEffect(() => {
    tickRef.current = (time: number) => {
      let shouldContinue = false;

      if (entryActiveRef.current) {
        if (entryStartedAtRef.current === null) {
          entryStartedAtRef.current = time;
        }

        const nextEntryProgress = clamp((time - entryStartedAtRef.current) / (entryDurationMs || 1));
        setEntryProgress((current) =>
          Math.abs(current - nextEntryProgress) > 0.0005 ? nextEntryProgress : current,
        );

        if (nextEntryProgress >= 1) {
          entryActiveRef.current = false;
          entryStartedAtRef.current = null;
          setEntryProgress(1);
        } else {
          shouldContinue = true;
        }
      }

      const speed = targetRef.current > progressRef.current ? enterSpeed : leaveSpeed;
      const nextProgress = clamp(lerp(progressRef.current, targetRef.current, speed));
      const progressSettled = Math.abs(nextProgress - targetRef.current) < stableEpsilon;
      const resolvedProgress = progressSettled ? targetRef.current : nextProgress;

      progressRef.current = resolvedProgress;
      setProgress((current) => (Math.abs(current - resolvedProgress) > 0.0005 ? resolvedProgress : current));

      if (!progressSettled) {
        shouldContinue = true;
      }

      if (idleActiveRef.current && !entryActiveRef.current) {
        if (idleStartedAtRef.current === null) {
          idleStartedAtRef.current = time;
        }

        const nextIdleElapsed = time - idleStartedAtRef.current;
        setIdleElapsedMs((current) => (Math.abs(current - nextIdleElapsed) > 8 ? nextIdleElapsed : current));
        shouldContinue = true;
      }

      if (!shouldContinue) {
        frameRef.current = null;
        return;
      }

      frameRef.current = window.requestAnimationFrame((nextTime) => {
        tickRef.current(nextTime);
      });
    };
  }, [enterSpeed, entryDurationMs, leaveSpeed, stableEpsilon]);

  const ensureFrame = useCallback(() => {
    if (frameRef.current !== null) {
      return;
    }

    frameRef.current = window.requestAnimationFrame((time) => {
      tickRef.current(time);
    });
  }, []);

  const setTarget = useCallback(
    (nextTarget: 0 | 1) => {
      cancelIntent();

      if (nextTarget === 1 && intentDelayMs > 0 && progressRef.current < 1) {
        targetRef.current = Math.max(progressRef.current, microMotionProgress);
        ensureFrame();
        intentTimerRef.current = window.setTimeout(() => {
          targetRef.current = 1;
          ensureFrame();
          intentTimerRef.current = null;
        }, intentDelayMs);
        return;
      }

      targetRef.current = nextTarget;
      ensureFrame();
    },
    [cancelIntent, ensureFrame, intentDelayMs, microMotionProgress],
  );

  const forceAction = useCallback(() => {
    cancelIntent();
    targetRef.current = 1;
    progressRef.current = 1;
    setProgress(1);
    ensureFrame();
  }, [cancelIntent, ensureFrame]);

  const startIdle = useCallback(
    ({ withEntry = false }: StartIdleOptions = {}) => {
      idleActiveRef.current = true;
      idleStartedAtRef.current = null;
      setIdleElapsedMs(0);

      if (withEntry && entryDurationMs > 0) {
        entryActiveRef.current = true;
        entryStartedAtRef.current = null;
        setEntryProgress(0);
      } else {
        entryActiveRef.current = false;
        entryStartedAtRef.current = null;
        setEntryProgress(entryDurationMs > 0 ? 1 : 0);
      }

      ensureFrame();
    },
    [ensureFrame, entryDurationMs],
  );

  const stop = useCallback(() => {
    cancelIntent();
    idleActiveRef.current = false;
    idleStartedAtRef.current = null;
    entryActiveRef.current = false;
    entryStartedAtRef.current = null;
    stopFrame();
  }, [cancelIntent, stopFrame]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    progress,
    entryProgress,
    idleElapsedMs,
    forceAction,
    startIdle,
    stop,
    setTarget,
  };
}
