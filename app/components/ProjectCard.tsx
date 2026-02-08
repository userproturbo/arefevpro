"use client";

import { motion } from "framer-motion";

export default function ProjectCard() {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="group relative w-full"
    >
      <div className="w-full h-56 rounded-xl bg-neutral-800/40 border border-neutral-700/40 shadow-[0_18px_40px_-26px_rgba(0,0,0,0.8)] transition-all duration-300 group-hover:shadow-lg" />
    </motion.div>
  );
}
