"use client";

import { motion } from "framer-motion";
import ProjectCard, { type ProjectCardItem } from "./ProjectCard";

const placeholderItems: Array<ProjectCardItem | undefined> = Array.from({ length: 6 }, () => undefined);

type ProjectsGridProps = {
  items?: Array<ProjectCardItem | undefined>;
};

export default function ProjectsGrid({ items = placeholderItems }: ProjectsGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
    >
      {items.map((item, idx) => (
        <ProjectCard key={item?.href ?? idx} item={item} />
      ))}
    </motion.div>
  );
}
