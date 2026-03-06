"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type SectionContentRevealProps = {
  children: ReactNode;
  enabled: boolean;
  delayMs?: number;
};

export default function SectionContentReveal({
  children,
  enabled: _enabled,
  delayMs: _delayMs = 620,
}: SectionContentRevealProps) {
  void _enabled;
  void _delayMs;

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0,
        delay: 0,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="h-full min-h-0"
    >
      {children}
    </motion.div>
  );
}
