import type { StationMode } from "./types";
import { motion } from "framer-motion";

type SystemStatusBarProps = {
  mode: StationMode;
};

export default function SystemStatusBar({ mode }: SystemStatusBarProps) {
  return (
    <header className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#1d442b] bg-[#07100b] px-3 py-2 text-[11px] uppercase tracking-[0.15em]">
      <span className="text-[#86b794]">Media Station / Online</span>

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded border border-[#2f5f42] bg-[#0a1510] px-2 py-0.5 text-[#b8f8c8]">
          Mode: {mode}
        </span>
        <span className="h-3 w-px bg-[#29523a]" aria-hidden="true" />
        <motion.span
          className="text-[#729d80]"
          initial={false}
          animate={{ opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
        >
          Link: Stable
        </motion.span>
        <span className="h-3 w-px bg-[#29523a]" aria-hidden="true" />
        <motion.span
          className="text-[#729d80]"
          initial={false}
          animate={{ opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
        >
          Signal: 100%
        </motion.span>
      </div>
    </header>
  );
}
