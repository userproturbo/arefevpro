"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import useCharacterMotion from "@/app/components/character/useCharacterMotion";
import { useCharacterAI } from "@/engine/characterAI/useCharacterAI";
import type { Section } from "@/store/uiStore";

type CharacterAssets = {
  idleSrc: string;
  actionSrc: string;
  alt: string;
};

const CHARACTER_ASSETS: Record<Section, CharacterAssets> = {
  photo: {
    idleSrc: "/img/Photo-idle.png",
    actionSrc: "/img/Photo-action.png",
    alt: "Photo character",
  },
  music: {
    idleSrc: "/img/Music-idle.png",
    actionSrc: "/img/Music-action.png",
    alt: "Music character",
  },
  video: {
    idleSrc: "/img/Drone-idle.png",
    actionSrc: "/img/Drone-action.png",
    alt: "Video character",
  },
  blog: {
    idleSrc: "/img/Blog-idle.png",
    actionSrc: "/img/Blog-action.png",
    alt: "Blog character",
  },
};

const MOUSE_RANGE = 16;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

type CharacterRendererProps = {
  activeSection: Section;
  hoverActive: boolean;
};

export default function CharacterRenderer({ activeSection, hoverActive }: CharacterRendererProps) {
  const { currentCharacterState } = useCharacterAI();
  const [mouseNorm, setMouseNorm] = useState({ x: 0, y: 0 });
  const { progress, idleElapsedMs, startIdle, setTarget } = useCharacterMotion({
    intentDelayMs: 120,
    enterSpeed: 0.11,
    leaveSpeed: 0.09,
    microMotionProgress: 0.28,
    entryDurationMs: 320,
  });

  useEffect(() => {
    startIdle({ withEntry: true });
    setTarget(1);
    const timer = window.setTimeout(() => {
      setTarget(0);
    }, 280);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeSection, setTarget, startIdle]);

  useEffect(() => {
    if (hoverActive) {
      setTarget(1);
      return;
    }

    if (currentCharacterState === "celebrating" || currentCharacterState === "reacting") {
      setTarget(1);
      const timer = window.setTimeout(() => {
        setTarget(0);
      }, currentCharacterState === "celebrating" ? 900 : 620);

      return () => {
        window.clearTimeout(timer);
      };
    }

    if (currentCharacterState === "sleepy") {
      setTarget(0.08);
      return;
    }

    if (currentCharacterState === "thinking") {
      setTarget(0.25);
      return;
    }

    if (currentCharacterState === "curious" || currentCharacterState === "focused" || currentCharacterState === "listening") {
      setTarget(0.45);
      return;
    }

    setTarget(0.18);
  }, [currentCharacterState, hoverActive, setTarget]);

  const assets = CHARACTER_ASSETS[activeSection];
  const stateIntensity =
    currentCharacterState === "celebrating"
      ? 1.28
      : currentCharacterState === "reacting"
        ? 1.08
        : currentCharacterState === "focused"
          ? 0.75
          : currentCharacterState === "listening"
            ? 0.7
            : currentCharacterState === "thinking"
              ? 0.55
              : currentCharacterState === "sleepy"
                ? 0.32
                : 0.62;
  const actionOpacity = clamp((progress - 0.2) / 0.8);
  const idleFloatY = Math.sin(idleElapsedMs * 0.0018) * 7 * stateIntensity;
  const idleRotate = Math.sin(idleElapsedMs * 0.001) * (1.2 * stateIntensity);
  const parallaxX = mouseNorm.x * MOUSE_RANGE * stateIntensity;
  const parallaxY = mouseNorm.y * (MOUSE_RANGE * 0.66) * stateIntensity;

  const frameTransform = useMemo(
    () => `translate3d(${parallaxX.toFixed(2)}px, ${(idleFloatY + parallaxY).toFixed(2)}px, 0) rotate(${idleRotate.toFixed(2)}deg)`,
    [idleFloatY, idleRotate, parallaxX, parallaxY],
  );

  return (
    <div
      className="relative h-full w-full"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        setMouseNorm({ x: (x - 0.5) * 2, y: (y - 0.5) * 2 });
      }}
      onMouseLeave={() => setMouseNorm({ x: 0, y: 0 })}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0"
            style={{
              transform: frameTransform,
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
          >
            <div className="absolute inset-[9%]">
              <div className="relative h-full w-full">
                <div className="absolute inset-0" style={{ opacity: 1 - actionOpacity }}>
                  <Image src={assets.idleSrc} alt={assets.alt} fill className="object-contain" priority unoptimized />
                </div>
                <div className="absolute inset-0" style={{ opacity: actionOpacity }}>
                  <Image src={assets.actionSrc} alt="" aria-hidden="true" fill className="object-contain" unoptimized />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
