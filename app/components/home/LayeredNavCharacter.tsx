"use client";

import Image from "next/image";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { flushSync } from "react-dom";
import useCharacterMotion from "@/app/components/character/useCharacterMotion";

type PointerValue = ReturnType<typeof useMotionValue<number>>;
type SpringValue = ReturnType<typeof useSpring>;

type MotionStyle = {
  wrapperTransform: string;
  actionOpacity: number;
};

export type LayeredNavCharacterBaseProps = {
  label: string;
  index: number;
  total: number;
  hoveredLabel: string | null;
  activeLabel: string | null;
  selectedLabel: string | null;
  idleDelay: number;
  pointerInsideRef: MutableRefObject<boolean>;
  pointerClientX: PointerValue;
  pointerClientY: PointerValue;
  cameraX: SpringValue;
  cameraY: SpringValue;
  cameraNormX: SpringValue;
  onScheduleHover: (label: string) => void;
  onClearHover: (label?: string) => void;
  onSetCameraBias: (x: number, y: number) => void;
  onSelect: (imageEl: HTMLImageElement | null) => void;
};

type LayeredNavCharacterProps = LayeredNavCharacterBaseProps & {
  idleSrc: string;
  actionSrc: string;
  audioSrc: string;
  audioVolume: number;
  soundThreshold: number;
  resetThreshold: number;
  motionConfig: {
    intentDelayMs: number;
    enterSpeed: number;
    leaveSpeed: number;
    microMotionProgress: number;
  };
  getMotionStyle: (progress: number) => MotionStyle;
};

export default function LayeredNavCharacter({
  label,
  index,
  total,
  hoveredLabel,
  activeLabel,
  selectedLabel,
  idleDelay,
  idleSrc,
  actionSrc,
  audioSrc,
  audioVolume,
  soundThreshold,
  resetThreshold,
  motionConfig,
  getMotionStyle,
  pointerInsideRef,
  pointerClientX,
  pointerClientY,
  cameraX,
  cameraY,
  cameraNormX,
  onScheduleHover,
  onClearHover,
  onSetCameraBias,
  onSelect,
}: LayeredNavCharacterProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const actionImageRef = useRef<HTMLImageElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playedRef = useRef(false);
  const baseLookXRef = useRef(0);
  const baseLookYRef = useRef(0);
  const boundsRef = useRef<{ centerX: number; centerY: number } | null>(null);

  const { progress, forceAction, setTarget } = useCharacterMotion({
    intentDelayMs: motionConfig.intentDelayMs,
    enterSpeed: motionConfig.enterSpeed,
    leaveSpeed: motionConfig.leaveSpeed,
    microMotionProgress: motionConfig.microMotionProgress,
  });

  const lookRotateX = useMotionValue(0);
  const lookRotateY = useMotionValue(0);
  const lookTranslateX = useMotionValue(0);
  const lookTranslateY = useMotionValue(0);
  const proximityScale = useMotionValue(1);
  const proximityLift = useMotionValue(0);

  const lookSpringConfig = useMemo(() => ({ stiffness: 90, damping: 22, mass: 0.8 }), []);
  const springRotateX = useSpring(lookRotateX, lookSpringConfig);
  const springRotateY = useSpring(lookRotateY, lookSpringConfig);
  const springTranslateX = useSpring(lookTranslateX, lookSpringConfig);
  const springTranslateY = useSpring(lookTranslateY, lookSpringConfig);
  const springProximityScale = useSpring(proximityScale, { stiffness: 80, damping: 20, mass: 0.9 });
  const springProximityLift = useSpring(proximityLift, { stiffness: 80, damping: 20, mass: 0.9 });

  const isHovered = hoveredLabel === label;
  const isActive = activeLabel === label;
  const isSelected = selectedLabel === label;
  const hasActiveCharacter = activeLabel !== null;
  const dimOthers = hasActiveCharacter && !isActive;
  const hideForSelection = selectedLabel !== null && !isSelected;

  const centerIndex = (total - 1) / 2;
  const distanceFromCenter = Math.abs(index - centerIndex);
  const depth = isHovered || isSelected ? 1 : distanceFromCenter <= 1 ? 0.7 : 0.45;

  const depthX = useTransform(cameraX, (value) => value * depth * -1);
  const depthY = useTransform(cameraY, (value) => value * depth * -1);
  const depthScale = useTransform(cameraNormX, (value) => 1 + depth * 0.015 * value);
  const layeredScale = useTransform(() => depthScale.get() * springProximityScale.get());

  const motionStyle = getMotionStyle(progress);

  useEffect(() => {
    const updateBaseLook = () => {
      baseLookXRef.current = Math.random() * 0.6 - 0.3;
      baseLookYRef.current = Math.random() * 0.4 - 0.2;
    };

    updateBaseLook();
    const intervalMs = 6000 + Math.round(Math.random() * 3000);
    const intervalId = window.setInterval(updateBaseLook, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const audio = new Audio(audioSrc);
    audio.preload = "auto";
    audio.volume = audioVolume;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [audioSrc, audioVolume]);

  useEffect(() => {
    if (progress >= soundThreshold && !playedRef.current) {
      playedRef.current = true;
      const audio = audioRef.current;
      if (audio) {
        try {
          audio.currentTime = 0;
          const playPromise = audio.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {});
          }
        } catch {}
      }
    } else if (progress < resetThreshold) {
      playedRef.current = false;
    }
  }, [progress, resetThreshold, soundThreshold]);

  useEffect(() => {
    const element = buttonRef.current;
    if (!element) {
      return;
    }

    const updateBounds = () => {
      const bounds = element.getBoundingClientRect();
      boundsRef.current = {
        centerX: bounds.left + bounds.width / 2,
        centerY: bounds.top + bounds.height / 2,
      };
    };

    updateBounds();
    const resizeObserver = new ResizeObserver(updateBounds);
    resizeObserver.observe(element);
    window.addEventListener("resize", updateBounds);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateBounds);
    };
  }, []);

  useEffect(() => {
    if (!isHovered) {
      return;
    }

    const element = buttonRef.current;
    if (!element) {
      return;
    }

    const parentBounds = element.parentElement?.parentElement?.getBoundingClientRect();
    if (!parentBounds) {
      return;
    }

    const bounds = element.getBoundingClientRect();
    boundsRef.current = {
      centerX: bounds.left + bounds.width / 2,
      centerY: bounds.top + bounds.height / 2,
    };
    const offsetX = bounds.left + bounds.width / 2 - (parentBounds.left + parentBounds.width / 2);
    const offsetY = bounds.top + bounds.height / 2 - (parentBounds.top + parentBounds.height / 2);
    onSetCameraBias(offsetX * 0.006, offsetY * 0.004);

    return () => {
      onSetCameraBias(0, 0);
    };
  }, [isHovered, onSetCameraBias]);

  useAnimationFrame(() => {
    const bounds = boundsRef.current;
    if (!bounds) {
      return;
    }

    let normalizedX = baseLookXRef.current;
    let normalizedY = baseLookYRef.current;

    if (pointerInsideRef.current) {
      const deltaX = pointerClientX.get() - bounds.centerX;
      const deltaY = pointerClientY.get() - bounds.centerY;
      const distance = Math.hypot(deltaX, deltaY);
      const cursorX = Math.max(-1, Math.min(1, deltaX / 320));
      const cursorY = Math.max(-1, Math.min(1, deltaY / 320));
      const strength = isHovered ? 1 : distance < 220 ? 0.5 : 0.2;
      const cursorDepth = Math.max(0, Math.min(1, 1 - distance / 700));

      normalizedX += cursorX * strength;
      normalizedY += cursorY * strength;
      proximityScale.set(1 + cursorDepth * 0.04);
      proximityLift.set(-cursorDepth * 8);
    } else {
      proximityScale.set(1);
      proximityLift.set(0);
    }

    normalizedX = Math.max(-1, Math.min(1, normalizedX));
    normalizedY = Math.max(-1, Math.min(1, normalizedY));

    lookRotateY.set(normalizedX * 3);
    lookRotateX.set(normalizedY * -2);
    lookTranslateX.set(normalizedX * 4);
    lookTranslateY.set(normalizedY * 2);
  });

  return (
    <motion.div
      className="relative"
      style={{ zIndex: isHovered || isSelected ? 20 : 1, perspective: 1200, x: depthX, y: depthY }}
      initial={{ y: -400, scale: 1.2, opacity: 0 }}
      animate={{ y: 0, scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 140,
        damping: 18,
        delay: index * 0.12,
      }}
    >
      <motion.button
        ref={buttonRef}
        type="button"
        onMouseEnter={() => {
          onScheduleHover(label);
          setTarget(1);
        }}
        onFocus={() => {
          onScheduleHover(label);
          setTarget(1);
        }}
        onBlur={() => {
          onClearHover(label);
          setTarget(0);
        }}
        onMouseLeave={() => {
          onClearHover(label);
          setTarget(0);
        }}
        onClick={() => {
          flushSync(() => {
            forceAction();
          });
          onSelect(actionImageRef.current);
        }}
        className="group relative block w-[min(72vw,228px)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:w-[190px] lg:w-[16.5vw] lg:max-w-[235px] xl:w-[17vw]"
        animate={{
          opacity: hideForSelection ? 0 : dimOthers ? 0.45 : 1,
          scale: isSelected ? 1.12 : isHovered ? 1.06 : isActive ? 1.02 : hideForSelection ? 0.8 : dimOthers ? 0.94 : 1,
          y: isSelected ? -20 : isHovered ? -12 : 0,
          filter: hideForSelection
            ? "blur(0px) brightness(1)"
            : dimOthers
              ? "blur(1.5px) brightness(0.9)"
              : "blur(0px) brightness(1)",
        }}
        transition={{
          opacity: {
            duration: hideForSelection ? 0.25 : activeLabel && !hoveredLabel ? 1.2 : 0.18,
            ease: activeLabel && !hoveredLabel ? [0.22, 1, 0.36, 1] : "easeOut",
          },
          scale: {
            duration: isSelected ? 0.35 : activeLabel && !hoveredLabel ? 1.2 : 0.18,
            ease: [0.22, 1, 0.36, 1],
          },
          y: { duration: isSelected ? 0.35 : 0.18, ease: [0.22, 1, 0.36, 1] },
          filter: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
        }}
        whileTap={{ scale: isSelected ? 1.12 : 1.02 }}
        aria-label={label}
      >
        <motion.div
          className="relative"
          animate={{
            y: [0, -6, 0],
            scaleY: [1, 1.015, 1],
            scaleX: [1, 0.995, 1],
            filter: isHovered ? "brightness(1.08)" : "brightness(1)",
          }}
          transition={{
            y: {
              duration: 5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: idleDelay,
            },
            scaleY: {
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: idleDelay,
            },
            scaleX: {
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: idleDelay,
            },
            filter: { duration: 0.18, ease: "easeOut" },
          }}
          style={{
            transformStyle: "preserve-3d",
            scale: layeredScale,
            y: springProximityLift,
            willChange: "transform",
          }}
        >
          <motion.div
            style={{
              rotateX: springRotateX,
              rotateY: springRotateY,
              x: springTranslateX,
              y: springTranslateY,
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
          >
            <div
              className="relative aspect-[4/5] w-full"
              style={{ transform: motionStyle.wrapperTransform, transformStyle: "preserve-3d", willChange: "transform" }}
            >
              <div className="absolute inset-0" style={{ opacity: 1 - motionStyle.actionOpacity, willChange: "opacity" }}>
                <Image
                  src={idleSrc}
                  alt={label}
                  fill
                  sizes="(max-width: 640px) min(72vw, 228px), (max-width: 1024px) 190px, (max-width: 1280px) 16.5vw, 17vw"
                  className="h-full w-full select-none object-contain [filter:drop-shadow(0_0_30px_rgba(0,0,0,0.8))]"
                />
              </div>
              <div
                className="pointer-events-none absolute inset-0"
                style={{ opacity: motionStyle.actionOpacity, willChange: "opacity" }}
              >
                <Image
                  ref={actionImageRef}
                  src={actionSrc}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="(max-width: 640px) min(72vw, 228px), (max-width: 1024px) 190px, (max-width: 1280px) 16.5vw, 17vw"
                  className="h-full w-full select-none object-contain [filter:drop-shadow(0_0_30px_rgba(0,0,0,0.8))]"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.button>
    </motion.div>
  );
}
