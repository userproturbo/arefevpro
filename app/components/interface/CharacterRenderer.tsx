"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import type { SiteSection } from "@/app/types/siteSections";
import BlogNavCharacter from "@/app/components/home/BlogNavCharacter";
import DroneNavCharacter from "@/app/components/home/DroneNavCharacter";
import MusicNavCharacter from "@/app/components/home/MusicNavCharacter";
import PhotoNavCharacter from "@/app/components/home/PhotoNavCharacter";
import { isCharacterNavSection } from "./sectionMeta";

function getCharacterLabel(section: SiteSection | null) {
  if (section === "photo") return "Photo";
  if (section === "music") return "Music";
  if (section === "video") return "Video";
  if (section === "blog") return "Blog";
  if (section === "projects") return "Projects";
  return "Home";
}

export default function CharacterRenderer({ activeSection }: { activeSection: SiteSection | null }) {
  const pointerInsideRef = useRef(false);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  const pointerClientX = useMotionValue(0);
  const pointerClientY = useMotionValue(0);
  const cameraBaseX = useMotionValue(0);
  const cameraBaseY = useMotionValue(0);
  const cameraBiasX = useMotionValue(0);
  const cameraBiasY = useMotionValue(0);
  const cameraNormXBase = useMotionValue(0);

  const cameraTargetX = useTransform(() => cameraBaseX.get() + cameraBiasX.get());
  const cameraTargetY = useTransform(() => cameraBaseY.get() + cameraBiasY.get());
  const cameraX = useSpring(cameraTargetX, { stiffness: 40, damping: 20, mass: 1 });
  const cameraY = useSpring(cameraTargetY, { stiffness: 40, damping: 20, mass: 1 });
  const cameraNormX = useSpring(cameraNormXBase, { stiffness: 40, damping: 20, mass: 1 });

  const label = getCharacterLabel(activeSection);

  const sharedProps = {
    label,
    index: 0,
    total: 1,
    hoveredLabel,
    activeLabel: label,
    selectedLabel: label,
    idleDelay: 0.2,
    pointerInsideRef,
    pointerClientX,
    pointerClientY,
    cameraX,
    cameraY,
    cameraNormX,
    onScheduleHover: (next: string) => setHoveredLabel(next),
    onClearHover: () => setHoveredLabel(null),
    onSetCameraBias: (x: number, y: number) => {
      cameraBiasX.set(x);
      cameraBiasY.set(y);
    },
    onSelect: () => {},
  };

  const renderCharacter = () => {
    if (!isCharacterNavSection(activeSection)) {
      return (
        <div className="relative h-full w-full max-w-[300px]">
          <Image
            src="/Home.png"
            alt="Home character"
            fill
            className="h-full w-full select-none object-contain [filter:drop-shadow(0_0_24px_rgba(0,0,0,0.72))]"
            sizes="(max-width: 768px) 70vw, 300px"
          />
        </div>
      );
    }

    if (activeSection === "photo") return <PhotoNavCharacter {...sharedProps} />;
    if (activeSection === "music") return <MusicNavCharacter {...sharedProps} />;
    if (activeSection === "blog") return <BlogNavCharacter {...sharedProps} />;

    // No dedicated video/projects sprite set exists yet; keep cinematic continuity with drone actor.
    return <DroneNavCharacter {...sharedProps} />;
  };

  return (
    <div
      className="h-full w-full"
      onMouseMove={(event) => {
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
        pointerInsideRef.current = false;
        cameraBaseX.set(0);
        cameraBaseY.set(0);
        cameraNormXBase.set(0);
        cameraBiasX.set(0);
        cameraBiasY.set(0);
        setHoveredLabel(null);
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeSection ?? "home"}
          initial={{ opacity: 0, scale: 0.85, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: -12 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="flex h-full w-full items-center justify-center px-2 py-2"
        >
          {renderCharacter()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
