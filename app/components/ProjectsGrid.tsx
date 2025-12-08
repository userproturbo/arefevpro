"use client";

import { motion } from "framer-motion";
import ProjectCard from "./ProjectCard";

const items = Array.from({ length: 6 });

export default function ProjectsGrid() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
    >
      {items.map((_, idx) => (
        <ProjectCard key={idx} />
      ))}
    </motion.div>
  );
}
