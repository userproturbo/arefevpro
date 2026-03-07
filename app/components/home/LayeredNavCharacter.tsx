"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { useCharacterConsole } from "@/store/characterConsoleStore";

export type LayeredNavCharacterBaseProps = {
  label?: string;
  index?: number;
  total?: number;
  hoveredLabel?: string | null;
  activeLabel?: string | null;
  selectedLabel?: string | null;
  exitActive?: boolean;
  idleDelay?: number;
  disableStageDepthEffects?: boolean;
  disableButtonYMotion?: boolean;
  disableIdleBobYMotion?: boolean;
  disableProximityLift?: boolean;
  disableLookMotion?: boolean;
  idleImageClassName?: string;
  actionImageClassName?: string;
  pointerInsideRef?: unknown;
  pointerClientX?: unknown;
  pointerClientY?: unknown;
  cameraX?: unknown;
  cameraY?: unknown;
  cameraNormX?: unknown;
  onScheduleHover?: (label: string) => void;
  onClearHover?: (label?: string) => void;
  onSetCameraBias?: (x: number, y: number) => void;
  onSelect?: (imageEl: HTMLImageElement | null) => void;
};

type LayeredNavCharacterProps = LayeredNavCharacterBaseProps & {
  idleSrc?: string;
  actionSrc?: string;
  audioSrc?: string;
  audioVolume?: number;
  motionConfig?: {
    intentDelayMs: number;
    enterSpeed: number;
    leaveSpeed: number;
    microMotionProgress: number;
  };
  getMotionStyle?: (progress: number, timeMs: number) => {
    wrapperTransform: string;
    actionOpacity: number;
    idleOpacity?: number;
    wrapperFilter?: string;
    wrapperTransition?: string;
    wrapperTransformOrigin?: string;
  };
};

const SECTION_IMAGES = {
  photo: { idle: "/img/Photo-idle.png", action: "/img/Photo-action.png" },
  music: { idle: "/img/Music-idle.png", action: "/img/Music-action.png" },
  video: { idle: "/img/video-idle.png", action: "/img/video-action.png" },
  blog: { idle: "/img/Blog-idle.png", action: "/img/Blog-action.png" },
} as const;

export default function LayeredNavCharacter(_props: LayeredNavCharacterProps = {}) {
  const section = useCharacterConsole((state) => state.section);
  const hover = useCharacterConsole((state) => state.hover);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const imageSrc = section
    ? (hover ? SECTION_IMAGES[section].action : SECTION_IMAGES[section].idle)
    : "/img/Home.png";
  const shadowOffsetX = (offset.x / 10) * 4;
  const shadowOffsetY = 10 + (offset.y / 10) * 4;
  const ambientShadow = `drop-shadow(${shadowOffsetX.toFixed(2)}px ${shadowOffsetY.toFixed(2)}px ${hover ? 40 : 20}px rgba(0,0,0,${hover ? 0.45 : 0.35}))`;
  const glowShadow = hover
    ? "0 0 60px rgba(255,255,255,0.12), 0 0 120px rgba(255,255,255,0.08)"
    : "0 0 40px rgba(255,255,255,0.05), 0 0 80px rgba(255,255,255,0.03)";

  return (
    <motion.div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{ x: offset.x, y: offset.y, willChange: "transform" }}
      transition={{ type: "spring", stiffness: 160, damping: 20, mass: 0.7 }}
      onMouseMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const normalizedX = (event.clientX - bounds.left) / bounds.width - 0.5;
        const normalizedY = (event.clientY - bounds.top) / bounds.height - 0.5;

        setOffset({
          x: Math.max(-10, Math.min(10, normalizedX * 20)),
          y: Math.max(-10, Math.min(10, normalizedY * 20)),
        });
      }}
      onMouseLeave={() => {
        setOffset({ x: 0, y: 0 });
      }}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[8%] rounded-[22px]"
        animate={{ opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        style={{
          boxShadow: glowShadow,
          transition: "box-shadow 0.35s ease",
          willChange: "opacity, box-shadow",
        }}
      />

      <motion.div
        className="relative h-full w-full will-change-transform"
        animate={{
          scale: [1, 1.015, 1],
          y: [0, -4, 0],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          filter: ambientShadow,
          transition: "filter 0.35s ease",
          willChange: "transform, filter",
        }}
      >
        <Image
          src={imageSrc}
          alt={section ? `${section} character` : "Home character"}
          fill
          priority
          className="object-contain"
          sizes="(max-width: 768px) 80vw, 360px"
        />
      </motion.div>
    </motion.div>
  );
}
