"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HomeCTA() {
  return (
    <motion.section
      id="contact"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,171,120,0.16),transparent_34%),radial-gradient(circle_at_bottom,rgba(88,158,255,0.14),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] px-6 py-14 text-center shadow-[0_28px_90px_-36px_rgba(0,0,0,0.88)] md:px-10"
    >
      <p className="text-[0.7rem] uppercase tracking-[0.28em] text-[#ffd0af]">Collaboration</p>
      <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-white md:text-5xl">
        Let&apos;s create something amazing together.
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/66 md:text-base">
        From cinematic drone flights to interactive portfolio experiences, the focus stays on images, rhythm and a
        clear visual point of view.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <a
          href="#home-hero"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#86c3ff]/40 bg-[linear-gradient(135deg,rgba(109,185,255,0.28),rgba(255,163,112,0.18))] px-6 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:border-[#86c3ff]/60"
        >
          Contact
        </a>
        <Link
          href="/video"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 bg-white/8 px-6 text-sm font-medium text-white/88 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-white/22 hover:bg-white/12"
        >
          View all videos
        </Link>
      </div>
    </motion.section>
  );
}
