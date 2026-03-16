"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import useCharacterMotion from "@/app/components/character/useCharacterMotion";
import useHeroTransition from "@/hooks/useHeroTransition";

type MusicSceneHeroProps = {
  children: ReactNode;
  isActivated?: boolean;
};

const ENTRY_DURATION_MS = 400;
const RAMP_DURATION_MS = 500;

export default function MusicSceneHero({ children, isActivated = false }: MusicSceneHeroProps) {
  const characterRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { entryProgress, idleElapsedMs, startIdle } = useCharacterMotion({
    entryDurationMs: ENTRY_DURATION_MS,
  });
  const {
    initialState,
    animateState,
    shouldAnimate,
    characterTransition,
    backgroundInitialState,
    backgroundAnimateState,
    backgroundTransition,
  } = useHeroTransition("music", isActivated);

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
    const frequency = isHovered ? 0.007 : 0.0038;
    const pulse = Math.sin(idleElapsedMs * frequency);
    const secondaryPulse = Math.cos(idleElapsedMs * (frequency * 0.84) + Math.PI / 3);
    const hoverBoost = isHovered ? 1.35 : 1;
    const activationBoost = isActivated ? 1 : 0;
    const translateY = pulse * (4 + 4 * ramp * hoverBoost);
    const rotateZ = secondaryPulse * (0.8 + 1.2 * ramp * hoverBoost);
    const translateZ = ramp * (18 + 24 * (secondaryPulse + 1) * 0.5) + activationBoost * 16;
    const scaleOvershoot = 1 + (1 - entryProgress) * (isActivated ? 0.1 : 0.07);
    const rhythmicScale = 1 + pulse * (0.01 + 0.012 * ramp * hoverBoost) + activationBoost * 0.03;
    const scale = idleElapsedMs <= 0 ? scaleOvershoot : rhythmicScale;
    const brightness = 1 + ramp * (isHovered ? 0.08 : 0.03) + activationBoost * 0.08;

    character.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, ${translateZ.toFixed(2)}px) scale(${scale.toFixed(4)}) rotateZ(${rotateZ.toFixed(3)}deg)`;
    character.style.filter = `brightness(${brightness.toFixed(3)}) saturate(${(1 + activationBoost * 0.12).toFixed(3)})`;
  }, [entryProgress, idleElapsedMs, isActivated, isHovered]);

  return (
    <section className="relative min-h-screen overflow-x-hidden bg-[#060507] lg:h-screen lg:overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(255,132,90,0.16),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(255,207,98,0.1),transparent_24%),linear-gradient(120deg,#070507_0%,#140b11_45%,#060507_100%)]"
        initial={backgroundInitialState}
        animate={backgroundAnimateState}
        transition={backgroundTransition}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[30vh] bg-[linear-gradient(180deg,transparent_0%,rgba(14,7,10,0.5)_34%,rgba(9,5,7,0.96)_100%)]"
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
                transform: "translate3d(0,0,0) scale(1.07)",
                transformStyle: "preserve-3d",
                willChange: "transform, filter",
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Image
                ref={imageRef}
                src="/img/Music-action.png"
                alt="Music character"
                width={1280}
                height={1600}
                priority
                sizes="(max-width: 1024px) min(88vw, 540px), min(56vw, 860px)"
                className={`h-auto max-h-[clamp(320px,70vh,720px)] w-full select-none object-contain ${isActivated ? "[filter:drop-shadow(0_0_42px_rgba(255,177,110,0.28))]" : ""}`}
              />
            </div>
          </motion.div>
        </div>

        <div className="relative flex min-h-0 flex-1 items-stretch lg:max-w-[min(44%,700px)]">
          <div className="flex min-h-0 w-full flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,10,14,0.82),rgba(8,5,8,0.96))]">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
