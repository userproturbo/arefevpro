"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export type ProjectCardItem = {
  href: string;
  title: string;
  techStack: string;
  imageSrc: string;
  imageAlt: string;
  eyebrow?: string;
};

type ProjectCardProps = {
  item?: ProjectCardItem;
};

export default function ProjectCard({ item }: ProjectCardProps) {
  if (!item) {
    return (
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="group relative w-full"
      >
        <div className="h-56 w-full rounded-xl border border-neutral-700/40 bg-neutral-800/40 shadow-[0_18px_40px_-26px_rgba(0,0,0,0.8)] transition-all duration-300 group-hover:shadow-lg" />
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="group relative w-full"
    >
      <Link
        href={item.href}
        className="block overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] shadow-[0_28px_60px_-30px_rgba(0,0,0,0.82)] transition-all duration-300 group-hover:border-white/20 group-hover:shadow-[0_34px_80px_-30px_rgba(0,0,0,0.9)]"
      >
        <div className="relative aspect-[16/11] overflow-hidden">
          <Image
            src={item.imageSrc}
            alt={item.imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,8,14,0.05),rgba(3,8,14,0.82))]" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            {item.eyebrow ? (
              <p className="text-[0.68rem] uppercase tracking-[0.26em] text-[#ffd3ba]">
                {item.eyebrow}
              </p>
            ) : null}
            <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/62">{item.techStack}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
