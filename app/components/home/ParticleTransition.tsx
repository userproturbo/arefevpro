"use client";

import { useEffect, useRef, useState } from "react";

type DissolveSnapshot = {
  src: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

type TransitionController = {
  dissolve: (imageEl: HTMLImageElement, awaitCompletion?: boolean) => Promise<boolean>;
  reform: (imageEl: HTMLImageElement) => Promise<boolean>;
};

const REFORM_STORAGE_KEY = "particle-transition:reform-image";

let controller: TransitionController | null = null;

export function setPendingParticleReform(imageSrc: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(REFORM_STORAGE_KEY, imageSrc);
}

export function consumePendingParticleReform(imageSrc: string) {
  if (typeof window === "undefined") {
    return false;
  }

  const pending = window.sessionStorage.getItem(REFORM_STORAGE_KEY);
  if (pending !== imageSrc) {
    return false;
  }

  window.sessionStorage.removeItem(REFORM_STORAGE_KEY);
  return true;
}

export async function triggerParticleDissolve(
  imageEl: HTMLImageElement,
  options?: { awaitCompletion?: boolean },
) {
  if (!controller) {
    return false;
  }

  return controller.dissolve(imageEl, options?.awaitCompletion);
}

export async function triggerParticleReform(imageEl: HTMLImageElement) {
  if (!controller) {
    return false;
  }

  return controller.reform(imageEl);
}

export default function ParticleTransition() {
  const [snapshot, setSnapshot] = useState<DissolveSnapshot | null>(null);
  const [phase, setPhase] = useState<"idle" | "dissolve">("idle");
  const completionRef = useRef<(() => void) | null>(null);
  const cleanupTimerRef = useRef<number | null>(null);
  const activeImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const clearTransition = () => {
      if (cleanupTimerRef.current !== null) {
        window.clearTimeout(cleanupTimerRef.current);
        cleanupTimerRef.current = null;
      }

      const image = activeImageRef.current;
      if (image) {
        image.style.opacity = "";
      }

      activeImageRef.current = null;
      setSnapshot(null);
      setPhase("idle");
      completionRef.current?.();
      completionRef.current = null;
    };

    controller = {
      dissolve: async (imageEl, awaitCompletion = true) => {
        const bounds = imageEl.getBoundingClientRect();
        const src = imageEl.currentSrc || imageEl.src;

        if (!src || bounds.width === 0 || bounds.height === 0) {
          return false;
        }

        if (cleanupTimerRef.current !== null) {
          window.clearTimeout(cleanupTimerRef.current);
        }

        activeImageRef.current = imageEl;
        imageEl.style.opacity = "0";
        setSnapshot({
          src,
          left: bounds.left,
          top: bounds.top,
          width: bounds.width,
          height: bounds.height,
        });
        setPhase("dissolve");
        cleanupTimerRef.current = window.setTimeout(clearTransition, 720);

        if (!awaitCompletion) {
          return true;
        }

        return new Promise<boolean>((resolve) => {
          completionRef.current = () => resolve(true);
        });
      },
      reform: async () => {
        return false;
      },
    };

    return () => {
      controller = null;
      if (cleanupTimerRef.current !== null) {
        window.clearTimeout(cleanupTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[100] ${snapshot ? "opacity-100" : "opacity-0"}`}
    >
      {snapshot ? (
        <div
          className="absolute will-change-[transform,opacity,filter] [filter:brightness(1)]"
          style={{
            left: snapshot.left,
            top: snapshot.top,
            width: snapshot.width,
            height: snapshot.height,
            backgroundImage: `url("${snapshot.src}")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "contain",
            transform: "translate3d(0,0,0) scale(1)",
            opacity: 1,
            transition: [
              "transform 680ms cubic-bezier(0.22, 1, 0.36, 1)",
              "opacity 620ms cubic-bezier(0.22, 1, 0.36, 1)",
              "filter 200ms ease",
            ].join(", "),
          }}
          ref={(node) => {
            if (!node || phase !== "dissolve") {
              return;
            }

            window.requestAnimationFrame(() => {
              node.style.filter = "brightness(1.25) blur(2px)";
              node.style.transform = "translate3d(0,0,0) scale(1.04)";
              node.style.opacity = "0";
            });
          }}
        />
      ) : null}
    </div>
  );
}
