"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

export type ViewportPhase = "closed" | "opening" | "open";

type TransitionShuttersProps = {
  viewportPhase: ViewportPhase;
  duration?: number;
  onPhaseComplete?: (phase: ViewportPhase) => void;
};

export default function TransitionShutters({
  viewportPhase,
  duration = 0.8,
  onPhaseComplete,
}: TransitionShuttersProps) {
  const isApertureOpen = viewportPhase !== "closed";

  useEffect(() => {
    if (viewportPhase === "open" || !onPhaseComplete) {
      return;
    }
    const timeoutId = window.setTimeout(() => {
      onPhaseComplete(viewportPhase);
    }, duration * 1000);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [duration, onPhaseComplete, viewportPhase]);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute left-0 top-0 h-1/2 w-full border-b border-[#2f5a41] bg-[#041108]"
        initial={false}
        animate={{ y: isApertureOpen ? "-70%" : "0%" }}
        transition={{ duration, ease: "easeInOut" }}
      >
        <motion.div
          className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded border border-[#2f5a41] bg-[#041108]/95 px-3 py-1"
          initial={false}
          animate={
            isApertureOpen
              ? { opacity: 1, scale: 1, y: 0 }
              : { opacity: 0, scale: 0.92, y: -8 }
          }
          transition={{ duration, ease: "easeInOut" }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#9ef6b2] sm:text-xs">
            AREFEVPRO
          </span>
        </motion.div>
      </motion.div>
      <motion.div
        className="absolute bottom-0 left-0 h-1/2 w-full border-t border-[#2f5a41] bg-[#041108]"
        initial={false}
        animate={{ y: isApertureOpen ? "70%" : "0%" }}
        transition={{ duration, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={false}
        animate={
          isApertureOpen
            ? { opacity: 0, scale: 0.95 }
            : { opacity: 1, scale: 1 }
        }
        transition={{ duration, ease: "easeInOut" }}
      >
        <span className="text-xl font-semibold uppercase tracking-[0.38em] text-[#9ef6b2] sm:text-2xl">
          AREFEVPRO
        </span>
      </motion.div>
    </div>
  );
}
