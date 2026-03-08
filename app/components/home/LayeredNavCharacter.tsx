"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState, type CSSProperties } from "react";
import { useCharacterConsole } from "@/store/characterConsoleStore";
import { characterScenes } from "@/config/characterScenes";

interface LayeredNavCharacterProps {
  idleSrc: string;
  actionSrc: string;
  audioSrc?: string;
  audioVolume?: number;
  motionConfig?: {
    intentDelayMs?: number;
    enterSpeed?: number;
    leaveSpeed?: number;
    microMotionProgress?: number;
    getMotionStyle?: (progress: number, timeMs: number) => CSSProperties;
  };
  onSelect?: (imageEl: HTMLImageElement | null) => void;
}

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

export default function LayeredNavCharacter(props: Partial<LayeredNavCharacterProps> = {}) {
  const { idleSrc, actionSrc, audioSrc, audioVolume, motionConfig, onSelect } = props;
  const section = useCharacterConsole((state) => state.section);
  const hover = useCharacterConsole((state) => state.hover);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const scene = section ? characterScenes[section] : null;
  const homeImageSrc = "/img/Home.png";
  const idleImageSrc = idleSrc ?? scene?.idleImage ?? homeImageSrc;
  const actionImageSrc = actionSrc ?? scene?.actionImage ?? null;
  const shadowOffsetX = (offset.x / 8) * 4;
  const shadowOffsetY = 20 + (offset.y / 8) * 4;
  const depthShadow = hover
    ? `drop-shadow(${shadowOffsetX.toFixed(2)}px ${(shadowOffsetY + 10).toFixed(2)}px 60px rgba(0,0,0,0.45))`
    : `drop-shadow(${shadowOffsetX.toFixed(2)}px ${shadowOffsetY.toFixed(2)}px 40px rgba(0,0,0,0.35))`;
  const characterVariants = {
    idle: {
      scale: 1,
      y: 0,
    },
    hover: {
      scale: 1.25,
      y: -20,
    },
  };
  void audioSrc;
  void audioVolume;
  void motionConfig;

  return (
    <motion.div
      className="relative flex h-full w-full items-end justify-center overflow-visible"
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
        className="relative h-full w-full overflow-visible will-change-transform"
        variants={characterVariants}
        animate={hover ? "hover" : "idle"}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{ willChange: "transform", transformOrigin: "bottom center" }}
      >
        <motion.div
          className="relative h-full w-full overflow-visible will-change-transform"
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
            transformOrigin: "bottom center",
          }}
        >
          <motion.div
            className="relative h-full w-full overflow-visible will-change-transform"
            animate={scene?.microAnimation ?? { scale: [1, 1, 1] }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            style={{ willChange: "transform", transformOrigin: "bottom center" }}
          >
            <motion.div
              className="relative h-full w-full overflow-visible"
              animate={{ scale: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{ willChange: "transform", transformOrigin: "bottom center" }}
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
                  width={1200}
                  height={1200}
                  priority
                  className="pointer-events-none absolute bottom-0 left-1/2 h-[90%] w-auto max-w-none -translate-x-1/2 object-contain object-bottom"
                  sizes="(max-width: 768px) 80vw, 360px"
                  ref={onSelect}
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
                    width={1200}
                    height={1200}
                    priority
                    className="pointer-events-none absolute bottom-0 left-1/2 h-[90%] w-auto max-w-none -translate-x-1/2 object-contain object-bottom"
                    sizes="(max-width: 768px) 80vw, 360px"
                  />
                </motion.div>
              ) : null}
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
