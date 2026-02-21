"use client";

import type { StationMode } from "./types";
import { motion } from "framer-motion";
import { SCENES } from "./scenes/sceneRegistry";
import { useHoverSound } from "@/app/hooks/useHoverSound";

type ModeSelectProps = {
  mode: StationMode;
  setMode: (mode: StationMode) => void;
};

export default function ModeSelect({ mode, setMode }: ModeSelectProps) {
  const playHoverSound = useHoverSound({
    src: "/audio/preloader-2s-001.mp3",
    volume: 0.3,
  });

  const sceneTabs = Object.values(SCENES);

  return (
    <nav
      className="mb-3 flex flex-wrap gap-1.5 rounded-xl border border-white/10 bg-[#060e0a]/90 p-1.5 shadow-[inset_0_0_0_1px_rgba(115,255,140,0.05),0_0_18px_rgba(0,255,255,0.04)]"
      aria-label="Station Mode Select"
    >
      {sceneTabs.map((scene) => {
        const isActive = scene.id === mode;

        return (
          <motion.button
            key={scene.id}
            type="button"
            onClick={() => setMode(scene.id)}
            onPointerEnter={() => playHoverSound()}
            aria-pressed={isActive}
            data-state={isActive ? "active" : "inactive"}
            className="station-mode-btn rounded-md border border-transparent bg-transparent px-3 py-1 text-xs uppercase tracking-[0.12em] text-white/45 shadow-none transition-colors duration-200 focus:outline-none hover:border-white/20 hover:text-white/80 data-[state=active]:border-white/20 data-[state=active]:text-white/80 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:!bg-transparent data-[state=active]:!shadow-none data-[state=active]:after:content-none"
            initial={false}
            animate={{ opacity: isActive ? 1 : 0.64 }}
            whileHover={{ opacity: isActive ? 1 : 0.9 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <span>{scene.label}</span>
          </motion.button>
        );
      })}
    </nav>
  );
}
