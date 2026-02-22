"use client";

import type { StationMode } from "./types";
import { motion } from "framer-motion";
import { SCENES } from "./scenes/sceneRegistry";
import { useHoverSound } from "@/app/hooks/useHoverSound";
import StationTicker from "./StationTicker";

type ModeSelectProps = {
  mode: StationMode;
  setMode: (mode: StationMode) => void;
};

const TICKER_TEXT_BY_MODE: Record<StationMode, string> = {
  home: "STATION ARCHIVE UNIT ONLINE // SELECT MODULE FOR MEDIA DIAGNOSTICS //",
  blog: "BLOG ARCHIVE LINKED // OPEN POSTS AND INSPECT LOG ENTRIES //",
  photo: "PHOTO ARCHIVE LINKED // OPEN ALBUMS AND INSPECT PHOTOS INSIDE STATION MODE //",
  video: "VIDEO ARCHIVE LINKED // STREAM CLIPS AND REVIEW SIGNAL FEEDS //",
  audio: "AUDIO ARCHIVE LINKED // RUN TRACK PLAYBACK AND MONITOR CHANNEL OUTPUT //",
};

export default function ModeSelect({ mode, setMode }: ModeSelectProps) {
  const playHoverSound = useHoverSound({
    src: "/audio/preloader-2s-001.mp3",
    volume: 0.3,
  });

  const sceneTabs = Object.values(SCENES);

  return (
    <nav
      className="mb-3 rounded-lg border border-white/8 bg-[#060e0a]/90 p-1 shadow-[inset_0_0_0_1px_rgba(115,255,140,0.04),0_0_12px_rgba(0,255,255,0.03)] md:rounded-xl md:p-1.5"
      aria-label="Station Mode Select"
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-stretch">
        <div
          className="flex min-w-0 flex-[0_0_auto] flex-nowrap items-center gap-[3px] whitespace-nowrap md:gap-1.5"
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
                className="station-mode-btn min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1 py-0.5 text-[10px] uppercase tracking-[0.04em] whitespace-nowrap text-white/45 shadow-none transition-colors duration-200 focus:outline-none hover:border-white/20 hover:text-white/80 data-[state=active]:border-white/20 data-[state=active]:text-white/80 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:!bg-transparent data-[state=active]:!shadow-none data-[state=active]:after:content-none md:flex-none md:px-3 md:py-1 md:text-xs md:tracking-[0.12em]"
                initial={false}
                animate={{ opacity: isActive ? 1 : 0.64 }}
                whileHover={{ opacity: isActive ? 1 : 0.9 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <span className="block truncate text-center">{scene.label}</span>
              </motion.button>
            );
          })}
        </div>

        <StationTicker text={TICKER_TEXT_BY_MODE[mode]} />
      </div>
    </nav>
  );
}
