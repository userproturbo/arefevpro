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
  enabled,
  delayMs = 620,
}: SectionContentRevealProps) {
  return (
    <motion.div
      initial={enabled ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: enabled ? delayMs / 1000 : 0,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="h-full min-h-0"
    >
      {children}
    </motion.div>
  );
}
