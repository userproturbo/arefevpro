"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState } from "react";

export default function HeroSection() {
  const heroVideos = [
    "/uploads/videos/1773688293383-369be15d-32f0-41fc-819e-e5f27ac92aa1.mp4",
    "/uploads/videos/1773688691640-7a516b0c-d211-40d2-b551-815484320193.mp4",
  ];
  const [videoIndex, setVideoIndex] = useState(0);
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 0.6], [1.04, 1.12]);

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-black">
      {/* Background video */}
      <motion.video
        style={{ scale }}
        className="absolute inset-0 h-full w-full object-cover"
        src={heroVideos[videoIndex]}
        autoPlay
        muted
        playsInline
        onEnded={() => setVideoIndex((i) => (i + 1) % heroVideos.length)}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(0,0,0,0.55),rgba(0,0,0,0.25)_50%,rgba(0,0,0,0.65)_100%)]" />

      {/* Content container */}
      <div className="relative z-10 w-full px-10">
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
