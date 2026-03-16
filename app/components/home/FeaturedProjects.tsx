"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ProjectsGrid from "@/app/components/ProjectsGrid";
import type { ProjectCardItem } from "@/app/components/ProjectCard";

const featuredProjects: ProjectCardItem[] = [
  {
    href: "/",
    title: "Character Interface",
    techStack: "Next.js 16 • React 19 • Framer Motion • immersive navigation",
    imageSrc: "/img/Home.png",
    imageAlt: "Character interface home project preview",
    eyebrow: "Interactive web",
  },
  {
    href: "/video",
    title: "Video Feed",
    techStack: "Next.js • custom media UI • motion-driven video browsing",
    imageSrc: "/img/Drone-action.png",
    imageAlt: "Drone project preview",
    eyebrow: "Cinematic systems",
  },
  {
    href: "/photo",
    title: "Photo Archive",
    techStack: "Next.js • gallery system • performance-focused media loading",
    imageSrc: "/img/Photo-action.png",
    imageAlt: "Photo archive project preview",
    eyebrow: "Visual storytelling",
  },
  {
    href: "/blog",
    title: "Blog Stream",
    techStack: "Prisma • dynamic content blocks • editorial presentation",
    imageSrc: "/img/Blog-action.png",
    imageAlt: "Blog stream project preview",
    eyebrow: "Creative identity",
  },
];

export default function FeaturedProjects() {
  return (
    <section id="featured-projects" className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
      >
        <div className="max-w-2xl">
          <p className="text-[0.7rem] uppercase tracking-[0.28em] text-[#8ec9ff]">Featured projects</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
            Selected experiences from the current portfolio system
          </h2>
        </div>
        <Link
          href="/projects"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/12 bg-white/8 px-5 text-sm font-medium text-white/84 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-white/22 hover:bg-white/12"
        >
          Open project grid
        </Link>
      </motion.div>

      <ProjectsGrid items={featuredProjects} />
    </section>
  );
}
