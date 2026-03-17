"use client";

import Image from "next/image";
import HeroVideoSlider from "./HeroVideoSlider";

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-black">
      <HeroVideoSlider />

      {/* Dark overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(0,0,0,0.55),rgba(0,0,0,0.25)_50%,rgba(0,0,0,0.65)_100%)]" />

      {/* Content container */}
      <div className="pointer-events-none relative z-10 w-full px-10">
        <div className="flex min-h-screen items-start pt-[14vh]">
          <div className="w-full lg:w-[56rem]">
            <h1 className="text-[clamp(2rem,4vw,3.6rem)] font-semibold leading-[0.9] tracking-[-0.04em] text-white">
              Cinematic drone films and immersive web experiences
            </h1>

            <p className="mt-8 max-w-xl text-lg text-white/70">
              FPV cinematography, motion-driven interfaces and interactive storytelling.
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
