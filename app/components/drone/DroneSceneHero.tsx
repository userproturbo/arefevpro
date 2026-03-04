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

type DroneSceneHeroProps = {
  children: ReactNode;
  isActivated?: boolean;
};

const ENTRY_DURATION_MS = 400;
const IDLE_PERIOD_MS = 5600;

export default function DroneSceneHero({ children, isActivated = false }: DroneSceneHeroProps) {
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
  } = useHeroTransition("drone", isActivated);

  useEffect(() => {
    const shouldReform = consumePendingParticleReform("/img/Drone-action.png");
    const character = characterRef.current;
    startIdle({ withEntry: true });

    if (shouldReform && imageRef.current) {
      void triggerParticleReform(imageRef.current);
    }

    return () => {
      if (character) {
        character.style.transform = "translate3d(0,0,40px) scale(1)";
      }
    };
  }, [startIdle]);

  useEffect(() => {
    const character = characterRef.current;
    if (!character) {
      return;
    }

    const overshootScale = 1 + (1 - entryProgress) * 0.05;
    const entryTranslateZ = 40 + (1 - entryProgress) * 40;
    const idlePhase = idleElapsedMs <= 0 ? 0 : (idleElapsedMs % IDLE_PERIOD_MS) / IDLE_PERIOD_MS;
    const translateY = Math.sin(idlePhase * Math.PI * 2) * 12;
    const translateX = Math.sin(idlePhase * Math.PI * 2 + Math.PI / 2.7) * 8;
    const rotateZ = Math.cos(idlePhase * Math.PI * 2 + Math.PI / 4) * 1;
    const idleTranslateZ = 40 + Math.sin(idlePhase * Math.PI * 2 + Math.PI / 3) * 10 + (isActivated ? 18 : 0);
    const translateZ = idleElapsedMs <= 0 ? entryTranslateZ : idleTranslateZ;
    const scale = idleElapsedMs <= 0 ? overshootScale + (isActivated ? 0.03 : 0) : 1 + (isActivated ? 0.03 : 0);

    character.style.transform = `translate3d(${translateX.toFixed(2)}px, ${translateY.toFixed(2)}px, ${translateZ.toFixed(2)}px) scale(${scale.toFixed(4)}) rotateZ(${rotateZ.toFixed(3)}deg)`;
    character.style.filter = `brightness(${(1 + (isActivated ? 0.09 : 0)).toFixed(3)}) saturate(${(1 + (isActivated ? 0.1 : 0)).toFixed(3)})`;
  }, [entryProgress, idleElapsedMs, isActivated]);

  return (
    <section className="relative min-h-screen overflow-x-hidden bg-[#030508] lg:h-screen lg:overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_16%_26%,rgba(85,157,224,0.18),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(135,191,255,0.1),transparent_24%),linear-gradient(115deg,#020406_0%,#07111b_42%,#030508_100%)]"
        initial={backgroundInitialState}
        animate={backgroundAnimateState}
        transition={backgroundTransition}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[30vh] bg-[linear-gradient(180deg,transparent_0%,rgba(4,9,14,0.52)_36%,rgba(3,7,11,0.96)_100%)]"
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
                transform: "translate3d(0,0,80px) scale(1.05)",
                transformStyle: "preserve-3d",
                willChange: "transform, filter",
              }}
            >
              <Image
                ref={imageRef}
                src="/img/Drone-action.png"
                alt="Drone character"
                width={1280}
                height={1600}
                priority
                sizes="(max-width: 1024px) min(88vw, 540px), min(56vw, 860px)"
                className={`h-auto max-h-[clamp(320px,70vh,720px)] w-full select-none object-contain ${isActivated ? "[filter:drop-shadow(0_0_44px_rgba(139,199,255,0.28))]" : ""}`}
              />
            </div>
          </motion.div>
        </div>

        <div className="relative flex min-h-0 flex-1 items-stretch lg:max-w-[min(44%,700px)]">
          <div className="flex min-h-0 w-full flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,14,20,0.82),rgba(3,8,14,0.96))]">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
