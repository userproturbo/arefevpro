"use client";

import Image from "next/image";
import { motion, useAnimationFrame, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { flushSync } from "react-dom";
import useCharacterMotion from "@/app/components/character/useCharacterMotion";
import { AudioManager } from "@/engine/AudioManager";

type PointerValue = ReturnType<typeof useMotionValue<number>>;
type SpringValue = ReturnType<typeof useSpring>;

type MotionStyle = {
  wrapperTransform: string;
  actionOpacity: number;
  idleOpacity?: number;
  wrapperFilter?: string;
  wrapperTransition?: string;
  wrapperTransformOrigin?: string;
};

export type LayeredNavCharacterBaseProps = {
  label: string;
  index: number;
  total: number;
  hoveredLabel: string | null;
  activeLabel: string | null;
  selectedLabel: string | null;
  exitActive?: boolean;
  idleDelay: number;
  disableStageDepthEffects?: boolean;
  disableButtonYMotion?: boolean;
  disableIdleBobYMotion?: boolean;
  disableProximityLift?: boolean;
  disableLookMotion?: boolean;
  idleImageClassName?: string;
  actionImageClassName?: string;
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
  getMotionStyle: (progress: number, timeMs: number) => MotionStyle;
};

export default function LayeredNavCharacter({
  label,
  index,
  total,
  hoveredLabel,
  activeLabel,
  selectedLabel,
  exitActive = false,
  idleDelay,
  disableStageDepthEffects = false,
  disableButtonYMotion = false,
  disableIdleBobYMotion = false,
  disableProximityLift = false,
  disableLookMotion = false,
  idleImageClassName,
  actionImageClassName,
  idleSrc,
  actionSrc,
  audioSrc,
  audioVolume,
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
  const poseRef = useRef<HTMLDivElement | null>(null);
  const idleLayerRef = useRef<HTMLDivElement | null>(null);
  const actionLayerRef = useRef<HTMLDivElement | null>(null);
  const isAudioPlayingRef = useRef(false);
  const baseLookXRef = useRef(0);
  const baseLookYRef = useRef(0);
  const boundsRef = useRef<{ centerX: number; centerY: number } | null>(null);
  const clickGlowTimeoutRef = useRef<number | null>(null);
  const [clickGlow, setClickGlow] = useState(false);

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
  const hasHoveredCharacter = hoveredLabel !== null;
  const hasIdleHighlight = !hasHoveredCharacter && activeLabel !== null;
  const isIdleHighlight = hasIdleHighlight && isActive;
  const dimOthers = hasHoveredCharacter ? !isHovered : hasIdleHighlight && !isIdleHighlight;
  const exitDimOthers = exitActive && selectedLabel !== null && !isSelected;

  const centerIndex = (total - 1) / 2;
  const distanceFromCenter = Math.abs(index - centerIndex);
  const depth = isHovered || isSelected ? 1 : distanceFromCenter <= 1 ? 0.7 : 0.45;

  const depthX = useTransform(cameraX, (value) => value * depth * -1);
  const depthY = useTransform(cameraY, (value) => value * depth * -1);

  // IMPORTANT: layeredScale still allowed (scene depth feel),
  // but we avoid any "button scale" and tap scale that causes blurry textures.
  const depthScale = useTransform(cameraNormX, (value) => 1 + depth * 0.015 * value);
  const layeredScale = useTransform(() =>
    disableStageDepthEffects ? 1 : depthScale.get() * springProximityScale.get(),
  );

  const applyMotionStyle = useCallback(
    (timeMs: number) => {
      const motionStyle = getMotionStyle(progress, timeMs);
      const glowFilter = clickGlow ? "brightness(1.15) drop-shadow(0 0 18px rgba(255,255,255,0.35))" : "";
      const composedFilter = [motionStyle.wrapperFilter, glowFilter].filter(Boolean).join(" ");

      if (poseRef.current) {
        poseRef.current.style.transform = motionStyle.wrapperTransform;
        poseRef.current.style.filter = composedFilter;
        poseRef.current.style.transition = disableStageDepthEffects ? "none" : motionStyle.wrapperTransition ?? "";
        poseRef.current.style.transformOrigin = motionStyle.wrapperTransformOrigin ?? "";
      }

      if (idleLayerRef.current) {
        idleLayerRef.current.style.opacity = `${motionStyle.idleOpacity ?? 1 - motionStyle.actionOpacity}`;
      }

      if (actionLayerRef.current) {
        actionLayerRef.current.style.opacity = `${motionStyle.actionOpacity}`;
      }
    },
    [clickGlow, disableStageDepthEffects, getMotionStyle, progress],
  );

  const playHoverAudio = useCallback(() => {
    if (!audioSrc) return;
    if (isAudioPlayingRef.current) return;

    isAudioPlayingRef.current = true;
    AudioManager.play(audioSrc, audioVolume);
  }, [audioSrc, audioVolume]);

  const stopHoverAudio = useCallback(() => {
    if (!isAudioPlayingRef.current) return;
    isAudioPlayingRef.current = false;
    AudioManager.stop();
  }, []);

  useEffect(() => {
    const updateBaseLook = () => {
      baseLookXRef.current = Math.random() * 0.6 - 0.3;
      baseLookYRef.current = Math.random() * 0.4 - 0.2;
    };

    updateBaseLook();
    const intervalMs = 6000 + Math.round(Math.random() * 3000);
    const intervalId = window.setInterval(updateBaseLook, intervalMs);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    applyMotionStyle(0);
  }, [applyMotionStyle]);

  useEffect(() => {
    return () => {
      if (clickGlowTimeoutRef.current !== null) {
        window.clearTimeout(clickGlowTimeoutRef.current);
      }
      AudioManager.stop();
      isAudioPlayingRef.current = false;
    };
  }, []);

  useEffect(() => {
    const element = buttonRef.current;
    if (!element) return;

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
    if (!isHovered) return;

    const element = buttonRef.current;
    if (!element) return;

    const parentBounds = element.parentElement?.parentElement?.getBoundingClientRect();
    if (!parentBounds) return;

    const bounds = element.getBoundingClientRect();
    boundsRef.current = {
      centerX: bounds.left + bounds.width / 2,
      centerY: bounds.top + bounds.height / 2,
    };

    const offsetX = bounds.left + bounds.width / 2 - (parentBounds.left + parentBounds.width / 2);
    const offsetY = bounds.top + bounds.height / 2 - (parentBounds.top + parentBounds.height / 2);
    onSetCameraBias(offsetX * 0.006, offsetY * 0.004);

    return () => onSetCameraBias(0, 0);
  }, [isHovered, onSetCameraBias]);

  useAnimationFrame((time) => {
    applyMotionStyle(time);

    if (exitActive) return;

    const bounds = boundsRef.current;
    if (!bounds) return;

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

      proximityScale.set(disableStageDepthEffects ? 1 : 1 + cursorDepth * 0.04);
      proximityLift.set(disableProximityLift ? 0 : -cursorDepth * 8);
    } else {
      proximityScale.set(1);
      proximityLift.set(0);
    }

    normalizedX = Math.max(-1, Math.min(1, normalizedX));
    normalizedY = Math.max(-1, Math.min(1, normalizedY));

    lookRotateY.set(disableLookMotion ? 0 : normalizedX * 3);
    lookRotateX.set(disableLookMotion ? 0 : normalizedY * -2);
    lookTranslateX.set(disableLookMotion ? 0 : normalizedX * 4);
    lookTranslateY.set(disableLookMotion ? 0 : normalizedY * 2);
  });

  return (
    <motion.div
      className="relative"
      style={{
        zIndex: isHovered || isSelected ? 20 : 1,
        perspective: 1600,
        x: disableStageDepthEffects ? 0 : depthX,
        y: disableStageDepthEffects ? 0 : depthY,
      }}
      // IMPORTANT: no entry scale (scale causes texture resampling and blur)
      initial={{ y: -400, opacity: 0, scale: 1 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
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
        onPointerEnter={() => {
          if (exitActive) return;
          playHoverAudio();
          onScheduleHover(label);
          setTarget(1);
        }}
        onFocus={() => {
          if (exitActive) return;
          onScheduleHover(label);
          setTarget(1);
        }}
        onBlur={() => {
          onClearHover(label);
          setTarget(0);
        }}
        onPointerLeave={() => {
          stopHoverAudio();
          setTarget(0);
        }}
        onClick={() => {
          setClickGlow(true);
          if (clickGlowTimeoutRef.current !== null) {
            window.clearTimeout(clickGlowTimeoutRef.current);
          }
          clickGlowTimeoutRef.current = window.setTimeout(() => {
            setClickGlow(false);
            clickGlowTimeoutRef.current = null;
          }, 140);

          flushSync(() => {
            forceAction();
          });
          onSelect(actionImageRef.current);
        }}
        className="group relative block w-[clamp(210px,18vw,320px)] max-w-full overflow-visible focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        animate={{
          opacity: exitDimOthers ? 0.4 : hasHoveredCharacter ? (dimOthers ? 0.35 : 1) : dimOthers ? 0.55 : 1,
          scale: hasHoveredCharacter ? (dimOthers ? 0.92 : isHovered ? 1.05 : 1) : dimOthers ? 0.97 : isIdleHighlight ? 1.03 : 1,
          y: disableButtonYMotion ? 0 : isHovered ? -6 : isIdleHighlight ? -4 : 0,
          // IMPORTANT: remove blur filter that makes the character look soft
          filter: exitDimOthers ? "brightness(0.85)" : dimOthers ? "brightness(0.9)" : "brightness(1)",
        }}
        transition={{
          opacity: {
            duration: 0.25,
            ease: [0.22, 1, 0.36, 1],
          },
          scale: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
          y: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
          filter: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
        }}
        // IMPORTANT: remove tap animation completely
        whileTap={{ scale: 1 }}
        aria-label={label}
      >
        <span className="absolute -inset-y-4 -inset-x-6 pointer-events-auto" aria-hidden="true" />
        <motion.div
          className="relative pointer-events-none"
          animate={{
            // idle bob is OK
            y: disableIdleBobYMotion ? 0 : [0, -6, 0],
            // IMPORTANT: remove subtle scale breathing to avoid constant resampling/softness
            scaleY: 1,
            scaleX: 1,
            filter: isHovered ? "brightness(1.08)" : "brightness(1)",
          }}
          transition={{
            y: {
              duration: 5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: idleDelay,
            },
            filter: { duration: 0.18, ease: "easeOut" },
          }}
          style={{
            transformStyle: "preserve-3d",
            // stage depth feel preserved here, not on button
            scale: layeredScale,
            y: disableProximityLift ? 0 : springProximityLift,
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
              ref={poseRef}
              className="pointer-events-none relative aspect-[4/5] w-full"
              style={{
                transform: "translate3d(0,0,0)",
                transformStyle: "preserve-3d",
                willChange: "transform, filter",
              }}
            >
              <div ref={idleLayerRef} className="absolute inset-0" style={{ opacity: 1, willChange: "opacity" }}>
                <Image
                  src={idleSrc}
                  alt={label}
                  fill
                  // IMPORTANT: maximize sharpness
                  quality={100}
                  unoptimized
                  sizes="(max-width: 640px) min(72vw, 228px), (max-width: 1024px) 190px, (max-width: 1280px) 16.5vw, 17vw"
                  style={{ imageRendering: "auto" }}
                  className={`h-full w-full select-none object-contain [filter:drop-shadow(0_0_30px_rgba(0,0,0,0.8))] ${idleImageClassName ?? ""}`}
                />
              </div>

              <div
                ref={actionLayerRef}
                className="pointer-events-none absolute inset-0"
                style={{ opacity: 0, willChange: "opacity" }}
              >
                <Image
                  // next/image forwards ref to underlying img in current versions,
                  // your existing code already relied on it, keep same behavior.
                  ref={actionImageRef}
                  src={actionSrc}
                  alt=""
                  aria-hidden="true"
                  fill
                  quality={100}
                  unoptimized
                  sizes="(max-width: 640px) min(72vw, 228px), (max-width: 1024px) 190px, (max-width: 1280px) 16.5vw, 17vw"
                  style={{ imageRendering: "auto" }}
                  className={`h-full w-full select-none object-contain [filter:drop-shadow(0_0_30px_rgba(0,0,0,0.8))] ${actionImageClassName ?? ""}`}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.button>
    </motion.div>
  );
}
