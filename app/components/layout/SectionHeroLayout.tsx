"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  consumePendingParticleReform,
  triggerParticleReform,
} from "@/app/components/home/ParticleTransition";

type SectionHeroLayoutProps = {
  imageSrc: string;
  imageAlt: string;
  children: ReactNode;
};

export default function SectionHeroLayout({
  imageSrc,
  imageAlt,
  children,
}: SectionHeroLayoutProps) {
  const imageShellRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!consumePendingParticleReform(imageSrc)) {
      return;
    }

    const imageElement = imageShellRef.current?.querySelector("img");
    if (!imageElement) {
      return;
    }

    void triggerParticleReform(imageElement);
  }, [imageSrc]);

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-black">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-4 py-6 sm:px-6 lg:flex-row lg:items-start lg:gap-12 lg:px-8 lg:py-10">
        <motion.aside
          className="relative lg:sticky lg:top-24 lg:w-[min(36vw,520px)] lg:flex-none"
          initial={{ opacity: 0, x: -40, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute inset-[-6%] -z-10 rounded-[32px] bg-white/8 blur-3xl" aria-hidden="true" />
          <div
            ref={imageShellRef}
            className="overflow-hidden rounded-[28px] border border-white/10 bg-black/70 shadow-[0_0_80px_rgba(255,255,255,0.06)]"
          >
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={1200}
              height={1500}
              priority
              className="h-auto w-full object-contain"
            />
          </div>
        </motion.aside>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </section>
  );
}
