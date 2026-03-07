"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useCallback, useMemo, useRef, useState } from "react";
import type { Section } from "@/store/uiStore";
import BlogNavCharacter from "@/app/components/home/BlogNavCharacter";
import DroneNavCharacter from "@/app/components/home/DroneNavCharacter";
import MusicNavCharacter from "@/app/components/home/MusicNavCharacter";
import PhotoNavCharacter from "@/app/components/home/PhotoNavCharacter";

type CharacterRendererProps = {
  section: Section;
};

const characterMap = {
  photo: PhotoNavCharacter,
  music: MusicNavCharacter,
  video: DroneNavCharacter,
  drone: DroneNavCharacter,
  blog: BlogNavCharacter,
  projects: PhotoNavCharacter,
} as const;

const labelMap: Record<Section, string> = {
  photo: "Photo",
  music: "Music",
  video: "Video",
  drone: "Drone",
  blog: "Blog",
  projects: "Projects",
};

export default function CharacterRenderer({ section }: CharacterRendererProps) {
  const pointerInsideRef = useRef(false);
  const pointerClientX = useMotionValue(0);
  const pointerClientY = useMotionValue(0);
  const cameraX = useSpring(0, { stiffness: 90, damping: 20, mass: 0.9 });
  const cameraY = useSpring(0, { stiffness: 90, damping: 20, mass: 0.9 });
  const cameraNormX = useSpring(0, { stiffness: 80, damping: 20, mass: 1 });
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  const Character = useMemo(() => characterMap[section], [section]);
  const label = labelMap[section];

  const setCameraBias = useCallback(
    (x: number, y: number) => {
      cameraX.set(x * 12);
      cameraY.set(y * 12);
      cameraNormX.set(Math.max(-1, Math.min(1, x)));
    },
    [cameraNormX, cameraX, cameraY],
  );

  return (
    <div
      className="relative h-full w-full"
      onPointerMove={(event) => {
        pointerInsideRef.current = true;
        pointerClientX.set(event.clientX);
        pointerClientY.set(event.clientY);
      }}
      onPointerEnter={(event) => {
        pointerInsideRef.current = true;
        pointerClientX.set(event.clientX);
        pointerClientY.set(event.clientY);
      }}
      onPointerLeave={() => {
        pointerInsideRef.current = false;
        setHoveredLabel(null);
        cameraX.set(0);
        cameraY.set(0);
        cameraNormX.set(0);
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={section}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.03, opacity: 0 }}
          transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          style={{ willChange: "transform, opacity" }}
        >
          <Character
            label={label}
            index={0}
            total={1}
            idleDelay={0.25}
            hoveredLabel={hoveredLabel}
            activeLabel={label}
            selectedLabel={label}
            pointerInsideRef={pointerInsideRef}
            pointerClientX={pointerClientX}
            pointerClientY={pointerClientY}
            cameraX={cameraX}
            cameraY={cameraY}
            cameraNormX={cameraNormX}
            onScheduleHover={setHoveredLabel}
            onClearHover={() => setHoveredLabel(null)}
            onSetCameraBias={setCameraBias}
            onSelect={() => undefined}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
