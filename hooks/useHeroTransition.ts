"use client";

import { useEffect, useMemo } from "react";
import type { TargetAndTransition, Transition } from "framer-motion";
import type { NavigationCharacter } from "@/lib/characterNavigation";
import { useNavigation } from "@/store/navigationStore";
import { AudioManager } from "@/engine/AudioManager";

const CHARACTER_ENTRY_DURATION_S = 0;
const BACKGROUND_ENTRY_DURATION_S = 0;
const BACKGROUND_DELAY_S = 0;

type UseHeroTransitionResult = {
  shouldAnimate: boolean;
  initialState: false | TargetAndTransition;
  animateState: TargetAndTransition;
  characterTransition: Transition;
  backgroundInitialState: false | TargetAndTransition;
  backgroundAnimateState: TargetAndTransition;
  backgroundTransition: Transition;
};

export default function useHeroTransition(sectionName: NavigationCharacter, isActivated: boolean): UseHeroTransitionResult {
  const selectedCharacter = useNavigation((state) => state.selectedCharacter);
  const setSelectedCharacter = useNavigation((state) => state.setSelectedCharacter);
  const shouldAnimate = isActivated && selectedCharacter === sectionName;

  useEffect(() => {
    if (!shouldAnimate) {
      return;
    }

    AudioManager.stop();

    const timeoutId = window.setTimeout(() => {
      setSelectedCharacter(null);
    }, Math.round(CHARACTER_ENTRY_DURATION_S * 1000) + 120);

    return () => {
      AudioManager.stop();
      window.clearTimeout(timeoutId);
    };
  }, [setSelectedCharacter, shouldAnimate]);

  return useMemo(
    () => ({
      shouldAnimate,
      initialState: false,
      animateState: { scale: 1, opacity: 1, filter: "none" },
      characterTransition: { duration: CHARACTER_ENTRY_DURATION_S, ease: [0.22, 1, 0.36, 1] },
      backgroundInitialState: false,
      backgroundAnimateState: { opacity: 1 },
      backgroundTransition: {
        duration: BACKGROUND_ENTRY_DURATION_S,
        delay: shouldAnimate ? BACKGROUND_DELAY_S : 0,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
    [shouldAnimate],
  );
}
