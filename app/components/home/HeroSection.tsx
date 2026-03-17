"use client";

import Image from "next/image";
import { useState } from "react";
import HeroVideoSlider, { type HeroVideoMetadata } from "./HeroVideoSlider";

export default function HeroSection() {
  const [activeVideo, setActiveVideo] = useState<HeroVideoMetadata | null>(null);

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-black">
      <HeroVideoSlider onVideoChange={setActiveVideo} />

      {/* Dark overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(0,0,0,0.55),rgba(0,0,0,0.25)_50%,rgba(0,0,0,0.65)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-black/45 via-black/15 to-transparent" />

      {/* Content container */}
      <div className="pointer-events-none absolute left-[60px] top-[20px] z-10 max-w-[640px] text-left">
        <div>
          <h1 className="text-3xl font-semibold leading-[0.95] tracking-tight text-left text-white md:text-5xl">
            Добро пожаловать в мир FPV-полётов,
            <br />
            где границы существуют только на земле.
          </h1>

          <div className="mt-5 text-left text-white/80">
            <p className="text-lg font-medium text-white md:text-xl">
              {activeVideo?.title ?? ""}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/70 md:text-base">
              {activeVideo?.description ?? ""}
            </p>
          </div>
        </div>
      </div>

      {/* Right character */}
      <div className="pointer-events-none absolute bottom-0 right-0 z-10">
        <Image
          src="/img/Drone-life.png"
          alt="FPV pilot"
          width={900}
          height={1100}
          priority
          className="h-[75vh] w-auto object-contain"
        />
      </div>
    </section>
  );
}
