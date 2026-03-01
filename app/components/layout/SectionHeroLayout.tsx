"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
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
  const frameRef = useRef<number | null>(null);
  const contentTimerRef = useRef<number | null>(null);
  const [heroVisible, setHeroVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const shouldReform = consumePendingParticleReform(imageSrc);
    const imageElement = imageShellRef.current?.querySelector("img");
    frameRef.current = window.requestAnimationFrame(() => {
      setHeroVisible(true);

      if (shouldReform && imageElement) {
        void triggerParticleReform(imageElement);
      }

      contentTimerRef.current = window.setTimeout(() => {
        setContentVisible(true);
      }, shouldReform ? 120 : 80);
    });

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      if (contentTimerRef.current !== null) {
        window.clearTimeout(contentTimerRef.current);
      }
    };
  }, [imageSrc]);

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-black">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 px-4 py-6 sm:px-6 lg:flex-row lg:items-start lg:gap-12 lg:px-8 lg:py-10">
        <motion.aside
          className="relative lg:sticky lg:top-24 lg:w-[min(36vw,520px)] lg:flex-none"
          initial={false}
          animate={{
            opacity: heroVisible ? 1 : 0,
            x: heroVisible ? 0 : -28,
            scale: heroVisible ? 1 : 0.98,
          }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div ref={imageShellRef} className="overflow-visible bg-transparent shadow-none">
            <Image
              src={imageSrc}
              alt={imageAlt}
              width={1200}
              height={1500}
              priority
              className="h-auto w-full object-contain [filter:drop-shadow(0_0_30px_rgba(0,0,0,0.8))]"
            />
          </div>
        </motion.aside>

        <motion.div
          className="min-w-0 flex-1"
          initial={false}
          animate={{
            opacity: contentVisible ? 1 : 0,
            y: contentVisible ? 0 : 20,
          }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}
