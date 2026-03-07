"use client";

import Image from "next/image";
import { motion } from "framer-motion";
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

  const imageSrc = section
    ? (hover ? SECTION_IMAGES[section].action : SECTION_IMAGES[section].idle)
    : "/img/Home.png";

  return (
    <motion.div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      animate={hover ? { scale: 1.02, y: -2 } : { scale: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div className="relative h-full w-full">
        <Image
          src={imageSrc}
          alt={section ? `${section} character` : "Home character"}
          fill
          priority
          className="object-contain"
          sizes="(max-width: 768px) 80vw, 360px"
        />
      </div>
    </motion.div>
  );
}
