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
  video: { idle: "/img/Drone-idle.png", action: "/img/Drone-action.png" },
  blog: { idle: "/img/Blog-idle.png", action: "/img/Blog-action.png" },
} as const;

export default function LayeredNavCharacter(_props: LayeredNavCharacterProps = {}) {
  const section = useCharacterConsole((state) => state.section);
  const hover = useCharacterConsole((state) => state.hover);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const homeImageSrc = "/img/Home.png";
  const idleImageSrc = section ? SECTION_IMAGES[section].idle : homeImageSrc;
  const actionImageSrc = section ? SECTION_IMAGES[section].action : null;
  const shadowOffsetX = (offset.x / 8) * 4;
  const shadowOffsetY = 20 + (offset.y / 8) * 4;
  const depthShadow = hover
    ? `drop-shadow(${shadowOffsetX.toFixed(2)}px ${(shadowOffsetY + 10).toFixed(2)}px 60px rgba(0,0,0,0.45))`
    : `drop-shadow(${shadowOffsetX.toFixed(2)}px ${shadowOffsetY.toFixed(2)}px 40px rgba(0,0,0,0.35))`;

  return (
    <motion.div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{ x: offset.x, y: offset.y, willChange: "transform" }}
      transition={{ type: "spring", stiffness: 160, damping: 20, mass: 0.7 }}
      onMouseMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const normalizedX = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
        const normalizedY = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;

        setOffset({
          x: Math.max(-8, Math.min(8, normalizedX * 8)),
          y: Math.max(-8, Math.min(8, normalizedY * 8)),
        });
      }}
      onMouseLeave={() => {
        setOffset({ x: 0, y: 0 });
      }}
    >
      <motion.div
        className="relative h-full w-full will-change-transform"
        animate={{
          scale: [1, 1.02, 1],
          y: [0, -4, 0],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          filter: depthShadow,
          transition: "filter 0.35s ease",
          willChange: "transform, filter",
        }}
      >
        <motion.div
          className="relative h-full w-full"
          animate={{ scale: hover ? 1.05 : 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{ willChange: "transform" }}
        >
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: hover && actionImageSrc ? 0 : 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ willChange: "opacity" }}
          >
            <Image
              src={idleImageSrc}
              alt={section ? `${section} character` : "Home character"}
              fill
              priority
              className="object-contain"
              sizes="(max-width: 768px) 80vw, 360px"
            />
          </motion.div>

          {actionImageSrc ? (
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: hover ? 1 : 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{ willChange: "opacity" }}
            >
              <Image
                src={actionImageSrc}
                alt=""
                aria-hidden="true"
                fill
                priority
                className="object-contain"
                sizes="(max-width: 768px) 80vw, 360px"
              />
            </motion.div>
          ) : null}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
