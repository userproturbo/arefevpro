"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";
import useCharacterMotion from "@/app/components/character/useCharacterMotion";
import {
  consumePendingParticleReform,
  triggerParticleReform,
} from "@/app/components/home/ParticleTransition";
import useHeroTransition from "@/hooks/useHeroTransition";

type PhotoSceneHeroProps = {
  children: ReactNode;
  isActivated?: boolean;
};

const ENTRY_DURATION_MS = 420;
const IDLE_PERIOD_MS = 5200;

export default function PhotoSceneHero({ children, isActivated = false }: PhotoSceneHeroProps) {
  const characterRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
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
  } = useHeroTransition("photo", isActivated);

  useEffect(() => {
    const shouldReform = consumePendingParticleReform("/img/Photo.png");
    const character = characterRef.current;
    startIdle({ withEntry: true });

    if (shouldReform && imageRef.current) {
      void triggerParticleReform(imageRef.current);
    }

    return () => {
      if (character) {
        character.style.transform = "translate3d(0,0,0) scale(1)";
      }
    };
  }, [startIdle]);

  useEffect(() => {
    const character = characterRef.current;
    if (!character) {
      return;
    }

    const overshoot = Math.sin(entryProgress * Math.PI) * 0.03;
    const idlePhase = idleElapsedMs <= 0 ? 0 : (idleElapsedMs % IDLE_PERIOD_MS) / IDLE_PERIOD_MS;
    const idleWave = Math.sin(idlePhase * Math.PI * 2);
    const secondaryWave = Math.cos(idlePhase * Math.PI * 2);
    const translateY = idleWave * 6;
    const rotateZ = secondaryWave * 0.5;
    const translateZ = ((secondaryWave + 1) / 2) * 12 + (isActivated ? 16 : 0);
    const scale = 1 + overshoot + idleWave * 0.005 + (isActivated ? 0.03 : 0);

    character.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, ${translateZ.toFixed(2)}px) scale(${scale.toFixed(4)}) rotateZ(${rotateZ.toFixed(3)}deg)`;
    character.style.filter = `brightness(${(1 + (isActivated ? 0.08 : 0)).toFixed(3)}) saturate(${(1 + (isActivated ? 0.08 : 0)).toFixed(3)})`;
  }, [entryProgress, idleElapsedMs, isActivated]);

  return (
    <section className="relative min-h-screen overflow-x-hidden bg-[#040404] lg:h-screen lg:overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_35%,rgba(255,220,160,0.14),transparent_32%),radial-gradient(circle_at_78%_18%,rgba(143,84,38,0.18),transparent_24%),linear-gradient(120deg,#050505_0%,#0b0806_48%,#040404_100%)]"
        initial={backgroundInitialState}
        animate={backgroundAnimateState}
        transition={backgroundTransition}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[28vh] bg-[linear-gradient(180deg,transparent_0%,rgba(6,4,3,0.45)_40%,rgba(13,8,5,0.94)_100%)]"
        initial={backgroundInitialState}
        animate={backgroundAnimateState}
        transition={backgroundTransition}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1680px] flex-col px-[clamp(24px,4vw,80px)] py-[clamp(20px,3vw,40px)] lg:h-screen lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div className="relative flex min-h-[36vh] items-end justify-center overflow-visible lg:h-full lg:w-[min(55%,820px)] lg:flex-none lg:justify-start [perspective:1400px]">
          <motion.div
            initial={initialState}
            animate={animateState}
            transition={characterTransition}
          >
            <div
              ref={characterRef}
              className="relative w-full max-w-[clamp(300px,42vw,760px)]"
              style={{ transform: "translate3d(0,0,0) scale(1)", transformStyle: "preserve-3d", willChange: "transform, filter" }}
            >
              <Image
                ref={imageRef}
                src="/img/Photo-action.png"
                alt="Photo character"
                width={1280}
                height={1600}
                priority
                sizes="(max-width: 1024px) min(86vw, 520px), min(55vw, 820px)"
                className={`h-auto max-h-[clamp(280px,65vh,680px)] w-full select-none object-contain ${isActivated ? "[filter:drop-shadow(0_0_38px_rgba(216,177,123,0.24))]" : ""}`}
              />
            </div>
          </motion.div>
        </div>

        <div className="relative flex min-h-0 flex-1 items-stretch lg:max-w-[min(45%,680px)]">
          <div className="flex min-h-0 w-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,10,10,0.78),rgba(7,7,7,0.92))]">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
