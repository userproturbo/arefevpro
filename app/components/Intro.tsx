"use client";

import { motion } from "framer-motion";

export default function Intro() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-4 text-center">
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-[clamp(2rem,6vw,4.5rem)] font-bold tracking-[0.16em] text-white"
      >
        AREFEVPRO
      </motion.span>
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        className="text-[clamp(1.4rem,4.5vw,2.5rem)] font-semibold uppercase tracking-[0.2em] text-emerald-300"
      >
        production
      </motion.span>
    </div>
  );
}
