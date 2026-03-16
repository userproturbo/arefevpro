"use client";

import { motion } from "framer-motion";

const items = [
  {
    title: "Drone Cinematography",
    description: "FPV flights, location scouting and dynamic aerial shots crafted to feel immersive and precise.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7">
        <circle cx="6" cy="6" r="3.25" />
        <circle cx="18" cy="6" r="3.25" />
        <circle cx="6" cy="18" r="3.25" />
        <circle cx="18" cy="18" r="3.25" />
        <path d="M9 9l6 6M15 9l-6 6M9.5 12h5" />
      </svg>
    ),
  },
  {
    title: "Web Development",
    description: "Interactive interfaces, motion-rich product pages and custom digital experiences built with modern web tools.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M4 5h16v14H4z" />
        <path d="M8 9l-3 3 3 3M16 9l3 3-3 3M13 8l-2 8" />
      </svg>
    ),
  },
  {
    title: "Creative Projects",
    description: "Visual concepts that merge direction, identity and storytelling into memorable experiences.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M12 3l2.8 5.67L21 9.54l-4.5 4.39 1.06 6.23L12 17.2l-5.56 2.96 1.06-6.23L3 9.54l6.2-.87z" />
      </svg>
    ),
  },
] as const;

export default function WhatIDoSection() {
  return (
    <section className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl"
      >
        <p className="text-[0.7rem] uppercase tracking-[0.28em] text-[#ffcdab]">What I do</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
          Motion, systems and visuals shaped as one creative practice
        </h2>
      </motion.div>

      <div className="grid gap-5 md:grid-cols-3">
        {items.map((item, index) => (
          <motion.article
            key={item.title}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -8 }}
            className="group rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_20px_60px_-36px_rgba(0,0,0,0.9)] transition-shadow duration-300 hover:shadow-[0_26px_80px_-28px_rgba(84,156,255,0.28)]"
          >
            <div className="inline-flex rounded-2xl border border-white/12 bg-white/8 p-3 text-[#8bc6ff] transition duration-300 group-hover:border-[#8bc6ff]/30 group-hover:text-[#b9ddff]">
              {item.icon}
            </div>
            <h3 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-white">{item.title}</h3>
            <p className="mt-3 text-sm leading-7 text-white/64">{item.description}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
