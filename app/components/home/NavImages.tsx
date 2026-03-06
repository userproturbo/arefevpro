"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import {
  setPendingParticleReform,
  triggerParticleDissolve,
} from "@/app/components/home/ParticleTransition";
import { buildCharacterHref, type NavigationCharacter } from "@/lib/characterNavigation";
import { useNavigation } from "@/store/navigationStore";
import BlogNavCharacter from "./BlogNavCharacter";
import CharacterHoverPanel, { type CharacterType } from "./CharacterHoverPanel";
import DroneNavCharacter from "./DroneNavCharacter";
import MusicNavCharacter from "./MusicNavCharacter";
import PhotoNavCharacter from "./PhotoNavCharacter";

type NavItem = {
  label: string;
  imageSrc: string;
  reformKey?: string;
  href?: string;
  character?: NavigationCharacter;
  onClick?: () => void;
  idleDelay: number;
};

function resolveCharacterFromLabel(label: string | null): CharacterType {
  if (!label) return null;
  const normalized = label.toLowerCase();
  if (normalized === "photo" || normalized === "drone" || normalized === "music" || normalized === "blog") {
    return normalized;
  }
  return null;
}

const navItems = (onReturnHome: () => void): NavItem[] => [
  { label: "Start", imageSrc: "/img/Start.png", onClick: onReturnHome, idleDelay: 0.15 },
  {
    label: "Photo",
    imageSrc: "/img/Photo.png",
    reformKey: "/img/Photo.png",
    href: "/photo",
    character: "photo",
    idleDelay: 0.8,
  },
  {
    label: "Drone",
    imageSrc: "/img/Drone-action.png",
    reformKey: "/img/Drone-action.png",
    href: "/drone",
    character: "drone",
    idleDelay: 1.35,
  },
  {
    label: "Music",
    imageSrc: "/img/Music-action.png",
    reformKey: "/img/Music-action.png",
    href: "/music",
    character: "music",
    idleDelay: 0.45,
  },
  { label: "Blog", imageSrc: "/img/Blog.png", href: "/blog", character: "blog", idleDelay: 1.7 },
];

type NavImagesProps = {
  onReturnHome: () => void;
};

type CharacterItemProps = {
  item: NavItem;
  index: number;
  total: number;
  hoveredLabel: string | null;
  activeLabel: string | null;
  selectedLabel: string | null;
  exitActive: boolean;
  pointerInsideRef: MutableRefObject<boolean>;
  pointerClientX: ReturnType<typeof useMotionValue<number>>;
  pointerClientY: ReturnType<typeof useMotionValue<number>>;
  cameraX: ReturnType<typeof useSpring>;
  cameraY: ReturnType<typeof useSpring>;
  cameraNormX: ReturnType<typeof useSpring>;
  onScheduleHover: (label: string) => void;
  onClearHover: (label?: string) => void;
  onSetCameraBias: (x: number, y: number) => void;
  onSelect: (item: NavItem, imageEl: HTMLImageElement | null) => void;
};

function CharacterItem({
  item,
  index,
  total,
  hoveredLabel,
  activeLabel,
  selectedLabel,
  exitActive,
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
}: CharacterItemProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const baseLookXRef = useRef(0);
  const baseLookYRef = useRef(0);
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

  const isHovered = hoveredLabel === item.label;
  const isActive = activeLabel === item.label;
  const isSelected = selectedLabel === item.label;
  const hasActiveCharacter = activeLabel !== null;
  const dimOthers = hasActiveCharacter && !isActive;
  const exitDimOthers = exitActive && selectedLabel !== null && !isSelected;
  const exitSelected = exitActive && isSelected;

  const centerIndex = (total - 1) / 2;
  const distanceFromCenter = Math.abs(index - centerIndex);
  const depth = isHovered || isSelected ? 1 : distanceFromCenter <= 1 ? 0.7 : 0.45;

  const depthX = useTransform(cameraX, (value) => value * depth * -1);
  const depthY = useTransform(cameraY, (value) => value * depth * -1);
  const depthScale = useTransform(cameraNormX, (value) => 1 + depth * 0.015 * value);
  const layeredScale = useTransform(() => depthScale.get() * springProximityScale.get());

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
    const offsetX = bounds.left + bounds.width / 2 - (parentBounds.left + parentBounds.width / 2);
    const offsetY = bounds.top + bounds.height / 2 - (parentBounds.top + parentBounds.height / 2);
    onSetCameraBias(offsetX * 0.006, offsetY * 0.004);

    return () => {
      onSetCameraBias(0, 0);
    };
  }, [isHovered, onSetCameraBias]);

  useAnimationFrame(() => {
    if (exitActive) {
      return;
    }

    const element = buttonRef.current;
    if (!element) {
      return;
    }

    const bounds = element.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;

    let normalizedX = baseLookXRef.current;
    let normalizedY = baseLookYRef.current;

    if (pointerInsideRef.current) {
      const deltaX = pointerClientX.get() - centerX;
      const deltaY = pointerClientY.get() - centerY;
      const distance = Math.hypot(deltaX, deltaY);
      const cursorX = Math.max(-1, Math.min(1, deltaX / 320));
      const cursorY = Math.max(-1, Math.min(1, deltaY / 320));
      const strength = isHovered ? 1 : distance < 220 ? 0.5 : 0.2;
      const maxDistance = 700;
      const depth = Math.max(0, Math.min(1, 1 - distance / maxDistance));

      normalizedX += cursorX * strength;
      normalizedY += cursorY * strength;
      proximityScale.set(1 + depth * 0.04);
      proximityLift.set(-depth * 8);
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
      style={{ zIndex: isHovered || isSelected ? 20 : 1, perspective: 1600, x: depthX, y: depthY }}
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
          if (exitActive) {
            return;
          }
          onScheduleHover(item.label);
        }}
        onFocus={() => {
          if (exitActive) {
            return;
          }
          onScheduleHover(item.label);
        }}
        onBlur={() => {
          if (exitActive) {
            return;
          }
          onClearHover(item.label);
        }}
        onMouseLeave={() => {
          if (exitActive) {
            return;
          }
          onClearHover(item.label);
        }}
        onClick={() => onSelect(item, buttonRef.current?.querySelector("img") ?? null)}
        className="group relative block w-[clamp(210px,18vw,320px)] max-w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        animate={{
          opacity: exitDimOthers ? 0.4 : dimOthers ? 0.45 : 1,
          scale: exitSelected
            ? 1.05
            : isSelected
              ? 1.12
            : isHovered
              ? 1.06
              : isActive
                ? 1.02
                : dimOthers
                  ? 0.94
                  : 1,
          y: exitSelected ? -8 : isSelected ? -20 : isHovered ? -12 : 0,
          filter: exitDimOthers
            ? "blur(0px) brightness(0.85)"
            : dimOthers
              ? "blur(1.5px) brightness(0.9)"
              : "blur(0px) brightness(1)",
        }}
        transition={{
          opacity: {
            duration: exitActive ? 0.25 : activeLabel && !hoveredLabel ? 1.2 : 0.18,
            ease: activeLabel && !hoveredLabel ? [0.22, 1, 0.36, 1] : "easeOut",
          },
          scale: {
            duration: exitActive ? 0.25 : isSelected ? 0.35 : activeLabel && !hoveredLabel ? 1.2 : 0.18,
            ease: [0.22, 1, 0.36, 1],
          },
          y: { duration: exitActive ? 0.25 : isSelected ? 0.35 : 0.18, ease: [0.22, 1, 0.36, 1] },
          filter: { duration: exitActive ? 0.25 : 0.4, ease: [0.22, 1, 0.36, 1] },
        }}
        whileTap={{ scale: exitSelected ? 1.05 : isSelected ? 1.12 : 1.02 }}
        aria-label={item.label}
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
              delay: item.idleDelay,
            },
            scaleY: {
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: item.idleDelay,
            },
            scaleX: {
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: item.idleDelay,
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
            <Image
              src={item.imageSrc}
              alt={item.label}
              width={720}
              height={900}
              className="h-auto w-full select-none object-contain [filter:drop-shadow(0_0_30px_rgba(0,0,0,0.8))]"
            />
          </motion.div>
        </motion.div>
      </motion.button>
    </motion.div>
  );
}

export default function NavImages({ onReturnHome }: NavImagesProps) {
  const router = useRouter();
  const setSelectedCharacter = useNavigation((state) => state.setSelectedCharacter);
  const items = navItems(onReturnHome);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [idleFocusedLabel, setIdleFocusedLabel] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [exitActive, setExitActive] = useState(false);
  const [supportsHover, setSupportsHover] = useState(true);
  const [mobileOpenedCharacter, setMobileOpenedCharacter] = useState<NavigationCharacter | null>(null);
  const hoverTimerRef = useRef<number | null>(null);
  const idleLoopTimerRef = useRef<number | null>(null);
  const idleLastLabelRef = useRef<string | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const pointerInsideRef = useRef(false);
  const navigatingRef = useRef(false);

  const pointerClientX = useMotionValue(0);
  const pointerClientY = useMotionValue(0);
  const cameraBaseX = useMotionValue(0);
  const cameraBaseY = useMotionValue(0);
  const cameraBiasX = useMotionValue(0);
  const cameraBiasY = useMotionValue(0);
  const cameraNormXBase = useMotionValue(0);
  const driftX = useMotionValue(0);
  const driftY = useMotionValue(0);

  const cameraTargetX = useTransform(() => cameraBaseX.get() + cameraBiasX.get());
  const cameraTargetY = useTransform(() => cameraBaseY.get() + cameraBiasY.get());
  const cameraNormX = useSpring(cameraNormXBase, { stiffness: 40, damping: 20, mass: 1 });
  const cameraX = useSpring(cameraTargetX, { stiffness: 40, damping: 20, mass: 1 });
  const cameraY = useSpring(cameraTargetY, { stiffness: 40, damping: 20, mass: 1 });
  const stageDriftX = useTransform(() => driftX.get() + cameraBaseX.get() * 0.066);
  const stageDriftY = useTransform(() => driftY.get() + cameraBaseY.get() * 0.1);

  const interactionLocked = selectedLabel !== null;
  const activeLabel = hoveredLabel ?? idleFocusedLabel;
  const panelCharacter = mobileOpenedCharacter ?? resolveCharacterFromLabel(hoveredLabel);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateSupportsHover = () => {
      setSupportsHover(mediaQuery.matches);
      if (mediaQuery.matches) {
        setMobileOpenedCharacter(null);
      }
    };

    updateSupportsHover();
    mediaQuery.addEventListener("change", updateSupportsHover);
    return () => mediaQuery.removeEventListener("change", updateSupportsHover);
  }, []);

  const clearIdleTimer = useCallback(() => {
    if (idleLoopTimerRef.current !== null) {
      window.clearTimeout(idleLoopTimerRef.current);
      idleLoopTimerRef.current = null;
    }
    idleLastLabelRef.current = null;
  }, []);

  const stopIdleFocus = useCallback(() => {
    clearIdleTimer();
    setIdleFocusedLabel(null);
  }, [clearIdleTimer]);

  useAnimationFrame((time) => {
    driftX.set(Math.sin(time * 0.00025) * 2);
    driftY.set(Math.cos(time * 0.00018) * 1.5);
  });

  useEffect(() => {
    if (interactionLocked || hoveredLabel || mobileOpenedCharacter) {
      clearIdleTimer();
      return;
    }

    const idleCandidates = items.filter((item) => item.character);
    if (idleCandidates.length === 0) {
      clearIdleTimer();
      return;
    }

    let disposed = false;
    const runIdlePulse = () => {
      if (disposed || interactionLocked || hoveredLabel || mobileOpenedCharacter || navigatingRef.current) {
        return;
      }

      const pool = idleCandidates.filter((item) => item.label !== idleLastLabelRef.current);
      const nextPool = pool.length > 0 ? pool : idleCandidates;
      const nextItem = nextPool[Math.floor(Math.random() * nextPool.length)] ?? nextPool[0];

      if (!nextItem) return;

      idleLastLabelRef.current = nextItem.label;
      setIdleFocusedLabel(nextItem.label);

      idleLoopTimerRef.current = window.setTimeout(() => {
        setIdleFocusedLabel(null);

        idleLoopTimerRef.current = window.setTimeout(
          runIdlePulse,
          2000 + Math.floor(Math.random() * 1001),
        );
      }, 1200);
    };

    idleLoopTimerRef.current = window.setTimeout(runIdlePulse, 2000);

    return () => {
      disposed = true;
      clearIdleTimer();
    };
  }, [clearIdleTimer, hoveredLabel, interactionLocked, items, mobileOpenedCharacter]);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current !== null) {
        window.clearTimeout(hoverTimerRef.current);
      }
      stopIdleFocus();
    };
  }, [stopIdleFocus]);

  const scheduleHover = (label: string) => {
    if (interactionLocked || navigatingRef.current) {
      return;
    }
    if (!supportsHover) {
      return;
    }

    stopIdleFocus();
    setMobileOpenedCharacter(null);

    if (hoverTimerRef.current !== null) {
      window.clearTimeout(hoverTimerRef.current);
    }

    hoverTimerRef.current = window.setTimeout(() => {
      setHoveredLabel(label);
      hoverTimerRef.current = null;
    }, 80);
  };

  const clearHover = useCallback((label?: string) => {
    if (navigatingRef.current) {
      return;
    }

    if (hoverTimerRef.current !== null) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }

    cameraBiasX.set(0);
    cameraBiasY.set(0);

    setHoveredLabel((current) => {
      if (!label) {
        return null;
      }

      return current === label ? null : current;
    });
  }, [cameraBiasX, cameraBiasY]);

  const handleSelect = useCallback(
    async (selectedItem: NavItem, imageEl: HTMLImageElement | null) => {
      if (navigatingRef.current) {
        return;
      }

      if (!selectedItem.href) {
        setMobileOpenedCharacter(null);
        setSelectedCharacter(null);
        selectedItem.onClick?.();
        return;
      }

      if (!supportsHover && selectedItem.character) {
        if (mobileOpenedCharacter !== selectedItem.character) {
          setMobileOpenedCharacter(selectedItem.character);
          setHoveredLabel(selectedItem.label);
          stopIdleFocus();
          setIdleFocusedLabel(null);
          return;
        }
      }

      navigatingRef.current = true;

      setHoveredLabel(selectedItem.label);
      setSelectedLabel(selectedItem.label);
      setExitActive(true);
      stopIdleFocus();
      setIdleFocusedLabel(null);
      pointerInsideRef.current = false;
      cameraBaseX.set(0);
      cameraBaseY.set(0);
      cameraNormXBase.set(0);
      cameraBiasX.set(0);
      cameraBiasY.set(0);

      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 250);
      });

      const transitionWorked = imageEl
        ? await triggerParticleDissolve(imageEl, { awaitCompletion: false })
        : false;

      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, transitionWorked ? 60 : 40);
      });

      setPendingParticleReform(selectedItem.reformKey ?? selectedItem.imageSrc);
      setSelectedCharacter(selectedItem.character ?? null);
      router.push(buildCharacterHref(selectedItem.href, selectedItem.character));
    },
    [
      cameraBaseX,
      cameraBaseY,
      cameraBiasX,
      cameraBiasY,
      cameraNormXBase,
      mobileOpenedCharacter,
      router,
      setSelectedCharacter,
      stopIdleFocus,
      supportsHover,
    ],
  );

  return (
    <motion.div
      ref={stageRef}
      className={`relative flex h-full w-full items-start justify-center overflow-hidden px-[clamp(12px,2vw,40px)] pt-[clamp(40px,8vh,100px)] ${interactionLocked ? "pointer-events-none" : ""}`}
      exit="hidden"
      animate={{ opacity: exitActive ? 0.72 : 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={(event) => {
        if (!supportsHover) {
          return;
        }
        if (navigatingRef.current) {
          return;
        }

        const bounds = event.currentTarget.getBoundingClientRect();
        const offsetX = event.clientX - (bounds.left + bounds.width / 2);
        const offsetY = event.clientY - (bounds.top + bounds.height / 2);

        pointerInsideRef.current = true;
        pointerClientX.set(event.clientX);
        pointerClientY.set(event.clientY);
        cameraBaseX.set(offsetX * 0.03);
        cameraBaseY.set(offsetY * 0.02);
        cameraNormXBase.set(Math.max(-1, Math.min(1, offsetX / (bounds.width / 2 || 1))));
      }}
      onMouseLeave={() => {
        if (!supportsHover) {
          return;
        }
        if (navigatingRef.current) {
          return;
        }

        pointerInsideRef.current = false;
        cameraBaseX.set(0);
        cameraBaseY.set(0);
        cameraNormXBase.set(0);
        cameraBiasX.set(0);
        cameraBiasY.set(0);
        clearHover();
      }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 bg-black"
        animate={{ opacity: exitActive ? 0.4 : 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="relative mx-auto flex w-full max-w-[1400px] flex-col items-center"
        animate={{ scale: exitActive ? 1.02 : interactionLocked ? 1.03 : 1 }}
        transition={{ duration: exitActive ? 0.25 : 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ x: stageDriftX, y: stageDriftY, willChange: "transform" }}
      >
        <div className="relative mx-auto flex w-full max-w-[1200px] flex-col px-6">
          <div className="relative flex w-full flex-wrap items-end justify-center gap-[clamp(0px,0.8vw,10px)] lg:flex-nowrap">
            {items.map((item, index) => (
              item.label === "Photo" ? (
                <PhotoNavCharacter
                  key={item.label}
                  label={item.label}
                  index={index}
                  total={items.length}
                  hoveredLabel={hoveredLabel}
                  activeLabel={activeLabel}
                  selectedLabel={selectedLabel}
                  exitActive={exitActive}
                  idleDelay={item.idleDelay}
                  pointerInsideRef={pointerInsideRef}
                  pointerClientX={pointerClientX}
                  pointerClientY={pointerClientY}
                  cameraX={cameraX}
                  cameraY={cameraY}
                  cameraNormX={cameraNormX}
                  onScheduleHover={scheduleHover}
                  onClearHover={clearHover}
                  onSetCameraBias={(x, y) => {
                    cameraBiasX.set(x);
                    cameraBiasY.set(y);
                  }}
                  onSelect={async (imageEl) => {
                    await handleSelect(item, imageEl);
                  }}
                />
              ) : item.label === "Drone" ? (
                <DroneNavCharacter
                  key={item.label}
                  label={item.label}
                  index={index}
                  total={items.length}
                  hoveredLabel={hoveredLabel}
                  activeLabel={activeLabel}
                  selectedLabel={selectedLabel}
                  exitActive={exitActive}
                  idleDelay={item.idleDelay}
                  pointerInsideRef={pointerInsideRef}
                  pointerClientX={pointerClientX}
                  pointerClientY={pointerClientY}
                  cameraX={cameraX}
                  cameraY={cameraY}
                  cameraNormX={cameraNormX}
                  onScheduleHover={scheduleHover}
                  onClearHover={clearHover}
                  onSetCameraBias={(x, y) => {
                    cameraBiasX.set(x);
                    cameraBiasY.set(y);
                  }}
                  onSelect={async (imageEl) => {
                    await handleSelect(item, imageEl);
                  }}
                />
              ) : item.label === "Music" ? (
                <MusicNavCharacter
                  key={item.label}
                  label={item.label}
                  index={index}
                  total={items.length}
                  hoveredLabel={hoveredLabel}
                  activeLabel={activeLabel}
                  selectedLabel={selectedLabel}
                  exitActive={exitActive}
                  idleDelay={item.idleDelay}
                  pointerInsideRef={pointerInsideRef}
                  pointerClientX={pointerClientX}
                  pointerClientY={pointerClientY}
                  cameraX={cameraX}
                  cameraY={cameraY}
                  cameraNormX={cameraNormX}
                  onScheduleHover={scheduleHover}
                  onClearHover={clearHover}
                  onSetCameraBias={(x, y) => {
                    cameraBiasX.set(x);
                    cameraBiasY.set(y);
                  }}
                  onSelect={async (imageEl) => {
                    await handleSelect(item, imageEl);
                  }}
                />
              ) : item.label === "Blog" ? (
                <BlogNavCharacter
                  key={item.label}
                  label={item.label}
                  index={index}
                  total={items.length}
                  hoveredLabel={hoveredLabel}
                  activeLabel={activeLabel}
                  selectedLabel={selectedLabel}
                  exitActive={exitActive}
                  idleDelay={item.idleDelay}
                  pointerInsideRef={pointerInsideRef}
                  pointerClientX={pointerClientX}
                  pointerClientY={pointerClientY}
                  cameraX={cameraX}
                  cameraY={cameraY}
                  cameraNormX={cameraNormX}
                  onScheduleHover={scheduleHover}
                  onClearHover={clearHover}
                  onSetCameraBias={(x, y) => {
                    cameraBiasX.set(x);
                    cameraBiasY.set(y);
                  }}
                  onSelect={async (imageEl) => {
                    await handleSelect(item, imageEl);
                  }}
                />
              ) : (
                <CharacterItem
                  key={item.label}
                  item={item}
                  index={index}
                  total={items.length}
                  hoveredLabel={hoveredLabel}
                  activeLabel={activeLabel}
                  selectedLabel={selectedLabel}
                  exitActive={exitActive}
                  pointerInsideRef={pointerInsideRef}
                  pointerClientX={pointerClientX}
                  pointerClientY={pointerClientY}
                  cameraX={cameraX}
                  cameraY={cameraY}
                  cameraNormX={cameraNormX}
                  onScheduleHover={scheduleHover}
                  onClearHover={clearHover}
                  onSetCameraBias={(x, y) => {
                    cameraBiasX.set(x);
                    cameraBiasY.set(y);
                  }}
                  onSelect={async (selectedItem, imageEl) => {
                    await handleSelect(selectedItem, imageEl);
                  }}
                />
              )
            ))}
          </div>
          <CharacterHoverPanel activeCharacter={panelCharacter} />
        </div>
      </motion.div>
    </motion.div>
  );
}
