"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import useCharacterMotion from "@/app/components/character/useCharacterMotion";
import useHeroTransition from "@/hooks/useHeroTransition";

type BlogSceneHeroProps = {
  children: ReactNode;
  isActivated?: boolean;
};

const ENTRY_DURATION_MS = 420;
const RAMP_DURATION_MS = 520;

export default function BlogSceneHero({ children, isActivated = false }: BlogSceneHeroProps) {
  const characterRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { entryProgress, idleElapsedMs, startIdle } = useCharacterMotion({
    entryDurationMs: ENTRY_DURATION_MS,
  });
  const {
    initialState,
    animateState,
    characterTransition,
    backgroundInitialState,
    backgroundAnimateState,
    backgroundTransition,
  } = useHeroTransition("blog", isActivated);

  useEffect(() => {
    const character = characterRef.current;

    startIdle({ withEntry: true });

    return () => {
      if (character) {
        character.style.transform = "translate3d(0,0,0) scale(1)";
        character.style.filter = "";
      }
    };
  }, [startIdle]);

  useEffect(() => {
    const character = characterRef.current;
    if (!character) {
      return;
    }

    const ramp = Math.min(1, idleElapsedMs / RAMP_DURATION_MS);
    const frequency = isHovered ? 0.0048 : 0.0026;
    const wave = Math.sin(idleElapsedMs * frequency);
    const secondaryWave = Math.cos(idleElapsedMs * (frequency * 0.82) + Math.PI / 4);
    const translateY = wave * (5 + 3 * ramp);
    const translateX = secondaryWave * (4 + 3 * ramp);
    const translateZ = 18 + ramp * 20 + (secondaryWave + 1) * 7 + (isActivated ? 14 : 0);
    const rotateZ = wave * (0.5 + 0.55 * ramp);
    const scaleOvershoot = 1 + (1 - entryProgress) * (isActivated ? 0.09 : 0.06);
    const idleScale = 1 + wave * 0.01 + (isHovered ? 0.02 : 0) + (isActivated ? 0.03 : 0);
    const scale = idleElapsedMs <= 0 ? scaleOvershoot : idleScale;
    const brightness = 1 + ramp * (isHovered ? 0.09 : 0.04) + (isActivated ? 0.08 : 0);

    character.style.transform = `translate3d(${translateX.toFixed(2)}px, ${translateY.toFixed(2)}px, ${translateZ.toFixed(2)}px) scale(${scale.toFixed(4)}) rotateZ(${rotateZ.toFixed(3)}deg)`;
    character.style.filter = `brightness(${brightness.toFixed(3)}) saturate(${(1 + (isActivated ? 0.1 : 0)).toFixed(3)})`;
  }, [entryProgress, idleElapsedMs, isActivated, isHovered]);

  return (
    <section className="relative min-h-screen overflow-x-hidden bg-[#050507] lg:h-screen lg:overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_18%_26%,rgba(255,126,92,0.16),transparent_30%),radial-gradient(circle_at_76%_18%,rgba(255,217,128,0.08),transparent_24%),linear-gradient(118deg,#050507_0%,#140b0d_42%,#060608_100%)]"
        initial={backgroundInitialState}
        animate={backgroundAnimateState}
        transition={backgroundTransition}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[30vh] bg-[linear-gradient(180deg,transparent_0%,rgba(13,7,9,0.52)_36%,rgba(9,5,7,0.96)_100%)]"
        initial={backgroundInitialState}
        animate={backgroundAnimateState}
        transition={backgroundTransition}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1720px] flex-col px-[clamp(24px,4vw,84px)] py-[clamp(20px,3vw,40px)] lg:h-screen lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <div className="relative flex min-h-[38vh] items-center justify-center overflow-visible lg:h-full lg:w-[min(56%,860px)] lg:flex-none lg:justify-start [perspective:1600px]">
          <motion.div
            initial={initialState}
            animate={animateState}
            transition={characterTransition}
          >
            <div
              ref={characterRef}
              className="relative w-full max-w-[clamp(320px,45vw,820px)]"
              style={{
                transform: "translate3d(0,0,0) scale(1.04)",
                transformStyle: "preserve-3d",
                willChange: "transform, filter",
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Image
                ref={imageRef}
                src="/img/Blog-action.png"
                alt="Blog character"
                width={1280}
                height={1600}
                priority
                sizes="(max-width: 1024px) min(88vw, 540px), min(56vw, 860px)"
                className={`h-auto max-h-[clamp(320px,70vh,720px)] w-full select-none object-contain ${isActivated ? "[filter:drop-shadow(0_0_42px_rgba(255,155,110,0.26))]" : ""}`}
              />
            </div>
          </motion.div>
        </div>

        <div className="relative flex min-h-0 flex-1 items-stretch lg:max-w-[min(44%,700px)]">
          <div className="flex min-h-0 w-full flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,12,14,0.82),rgba(8,6,8,0.96))]">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
