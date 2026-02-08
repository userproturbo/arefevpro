import type { StationMode } from "./types";
import { motion } from "framer-motion";
import { STATION_MODES } from "./types";

type ModeSelectProps = {
  mode: StationMode;
  onSelectMode: (mode: StationMode) => void;
};

function toLabel(mode: StationMode): string {
  return mode.toUpperCase();
}

export default function ModeSelect({
  mode,
  onSelectMode,
}: ModeSelectProps) {
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
            onClick={() => onSelectMode(item)}
            aria-pressed={isActive}
            className="rounded-md border px-3 py-1.5 text-xs uppercase tracking-[0.16em]"
            initial={false}
            animate={isActive ? { opacity: [0.9, 1, 0.9] } : { opacity: 0.62 }}
            transition={
              isActive
                ? { duration: 10, ease: "easeInOut", repeat: Infinity }
                : { duration: 0 }
            }
            style={{
              borderColor: isActive ? "#3a7352" : "#274a35",
              color: isActive ? "#c4fcd2" : "#86b896",
              background: isActive ? "#0e1b14" : "#08120d",
              boxShadow: isActive
                ? "0 0 0 1px rgba(115,255,140,0.16), 0 0 10px rgba(115,255,140,0.18)"
                : "none",
            }}
          >
            {toLabel(item)}
          </motion.button>
        );
      })}
    </nav>
  );
}
