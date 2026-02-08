"use client";

import type { StationMode } from "./types";
import { motion } from "framer-motion";
import { STATION_MODES } from "./types";
import { useHoverSound } from "@/app/hooks/useHoverSound";

type ModeSelectProps = {
  mode: StationMode;
  setMode: (mode: StationMode) => void;
};

function toLabel(mode: StationMode): string {
  return mode.toUpperCase();
}

export default function ModeSelect({ mode, setMode }: ModeSelectProps) {
  const playHoverSound = useHoverSound({
    src: "/audio/preloader-2s-001.mp3",
    volume: 0.3,
  });

  return (
    <nav
      className="mb-3 flex flex-wrap gap-1.5 rounded-lg border border-[#1d442b] bg-[#060e0a] p-1.5"
      aria-label="Station Mode Select"
    >
      {STATION_MODES.map((item) => {
        const isActive = item === mode;

        return (
          <motion.button
            key={item}
            type="button"
            onClick={() => setMode(item)}
            onPointerEnter={() => playHoverSound()}
            aria-pressed={isActive}
            className={`station-mode-btn rounded-md border px-3 py-1.5 text-xs uppercase tracking-[0.16em] focus:outline-none ${
              isActive
                ? "is-active border-[#3a7352] bg-[#0e1b14] text-[#c4fcd2] shadow-[0_0_0_1px_rgba(115,255,140,0.16),0_0_10px_rgba(115,255,140,0.18)]"
                : "border-[#274a35] bg-[#08120d] text-[#86b896]"
            }`}
            initial={false}
            animate={isActive ? { opacity: [0.9, 1, 0.9] } : { opacity: 0.62 }}
            transition={
              isActive
                ? { duration: 10, ease: "easeInOut", repeat: Infinity }
                : { duration: 0 }
            }
          >
            {toLabel(item)}
          </motion.button>
        );
      })}
    </nav>
  );
}
