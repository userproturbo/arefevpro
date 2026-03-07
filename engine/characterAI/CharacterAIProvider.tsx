"use client";

import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useUiStore, type Section } from "@/store/uiStore";
import { getNextBehaviorDeadlineMs, resolveCharacterState, resolveSectionByPathname } from "./behaviorEngine";
import { CHARACTER_AI_EVENT, mapReactionToTransition, type CharacterAIReactionDetail } from "./reactions";
import { type CharacterAIInteractionType, type CharacterAITransientState, type CharacterState } from "./characterStates";

type RegisterPayload = {
  section?: Section;
  speed?: number;
};

type CharacterAIContextValue = {
  currentCharacterState: CharacterState;
  activeSection: Section;
  isHovering: boolean;
  isScrolling: boolean;
  lastInteractionAt: number;
  registerInteraction: (type: CharacterAIInteractionType, payload?: RegisterPayload) => void;
  setCharacterState: (state: CharacterState, durationMs?: number) => void;
};

export const CharacterAIContext = createContext<CharacterAIContextValue | null>(null);

const STATE_TRANSITION_DELAY_MS = 300;

export default function CharacterAIProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const uiSection = useUiStore((state) => state.activeSection);

  const [currentCharacterState, setCurrentCharacterState] = useState<CharacterState>("idle");
  const [lastInteractionAt, setLastInteractionAt] = useState<number>(() => Date.now());
  const [isHovering, setIsHovering] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(0);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [transientState, setTransientState] = useState<CharacterAITransientState | null>(null);

  const activeSection = useMemo(
    () => resolveSectionByPathname(pathname ?? "", uiSection),
    [pathname, uiSection],
  );
  const debugEnabled = searchParams?.get("debugAI") === "1";

  const transitionTimerRef = useRef<number | null>(null);
  const idleDeadlineTimerRef = useRef<number | null>(null);
  const scrollStopTimerRef = useRef<number | null>(null);

  const touchInteraction = useCallback(() => {
    const now = Date.now();
    setLastInteractionAt(now);
    setNowMs(now);
  }, []);

  const applyTransientState = useCallback((state: CharacterState, durationMs: number) => {
    const now = Date.now();
    setTransientState({
      state,
      until: now + durationMs,
    });
    setLastInteractionAt(now);
    setNowMs(now);
  }, []);

  const setCharacterState = useCallback(
    (state: CharacterState, durationMs?: number) => {
      if (durationMs && durationMs > 0) {
        applyTransientState(state, durationMs);
        return;
      }
      setTransientState(null);
      setCurrentCharacterState(state);
      touchInteraction();
    },
    [applyTransientState, touchInteraction],
  );

  const registerInteraction = useCallback(
    (type: CharacterAIInteractionType, payload?: RegisterPayload) => {
      if (type === "hover_start") {
        setIsHovering(true);
        touchInteraction();
        return;
      }

      if (type === "hover_end") {
        setIsHovering(false);
        setNowMs(Date.now());
        return;
      }

      if (type === "scroll") {
        const speed = payload?.speed ?? 0;
        setIsScrolling(true);
        setScrollSpeed(speed);
        touchInteraction();
        if (scrollStopTimerRef.current !== null) {
          window.clearTimeout(scrollStopTimerRef.current);
        }
        scrollStopTimerRef.current = window.setTimeout(() => {
          setIsScrolling(false);
          setScrollSpeed(0);
          setNowMs(Date.now());
          scrollStopTimerRef.current = null;
        }, 240);
        return;
      }

      if (type === "like") {
        applyTransientState("celebrating", 1_500);
        return;
      }

      if (type === "comment_posted") {
        applyTransientState("reacting", 1_000);
        return;
      }

      if (type === "content_loaded") {
        applyTransientState("focused", 900);
        return;
      }

      if (type === "section_change") {
        applyTransientState("reacting", 1_000);
        return;
      }

      touchInteraction();
    },
    [applyTransientState, touchInteraction],
  );

  const desiredState = useMemo(() => {
    return resolveCharacterState({
      now: nowMs,
      lastInteractionAt,
      isHovering,
      isScrolling,
      scrollSpeed,
      activeSection,
      transientState,
    });
  }, [activeSection, isHovering, isScrolling, lastInteractionAt, nowMs, scrollSpeed, transientState]);

  useEffect(() => {
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    if (desiredState === currentCharacterState) {
      return;
    }

    transitionTimerRef.current = window.setTimeout(() => {
      setCurrentCharacterState(desiredState);
      transitionTimerRef.current = null;
    }, STATE_TRANSITION_DELAY_MS);

    return () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }
    };
  }, [currentCharacterState, desiredState]);

  useEffect(() => {
    const nextDeadlineMs = getNextBehaviorDeadlineMs(nowMs, lastInteractionAt, transientState);

    if (idleDeadlineTimerRef.current !== null) {
      window.clearTimeout(idleDeadlineTimerRef.current);
      idleDeadlineTimerRef.current = null;
    }

    if (nextDeadlineMs === null) return;

    idleDeadlineTimerRef.current = window.setTimeout(() => {
      setNowMs(Date.now());
      idleDeadlineTimerRef.current = null;
    }, Math.max(40, nextDeadlineMs));

    return () => {
      if (idleDeadlineTimerRef.current !== null) {
        window.clearTimeout(idleDeadlineTimerRef.current);
        idleDeadlineTimerRef.current = null;
      }
    };
  }, [lastInteractionAt, currentCharacterState, desiredState, nowMs, transientState]);

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      registerInteraction("section_change", { section: activeSection });
    });
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [activeSection, registerInteraction]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const pointerHandler = () => registerInteraction("interaction");
    const keyHandler = () => registerInteraction("interaction");

    const reactionHandler = (event: Event) => {
      const customEvent = event as CustomEvent<CharacterAIReactionDetail>;
      if (!customEvent.detail) return;
      const transition = mapReactionToTransition(customEvent.detail.type);
      applyTransientState(transition.state, transition.durationMs);
    };

    window.addEventListener("pointerdown", pointerHandler, { passive: true });
    window.addEventListener("keydown", keyHandler);
    window.addEventListener(CHARACTER_AI_EVENT, reactionHandler as EventListener);

    return () => {
      window.removeEventListener("pointerdown", pointerHandler);
      window.removeEventListener("keydown", keyHandler);
      window.removeEventListener(CHARACTER_AI_EVENT, reactionHandler as EventListener);
    };
  }, [applyTransientState, registerInteraction]);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current !== null) window.clearTimeout(transitionTimerRef.current);
      if (idleDeadlineTimerRef.current !== null) window.clearTimeout(idleDeadlineTimerRef.current);
      if (scrollStopTimerRef.current !== null) window.clearTimeout(scrollStopTimerRef.current);
    };
  }, []);

  const contextValue = useMemo<CharacterAIContextValue>(
    () => ({
      currentCharacterState,
      activeSection,
      isHovering,
      isScrolling,
      lastInteractionAt,
      registerInteraction,
      setCharacterState,
    }),
    [activeSection, currentCharacterState, isHovering, isScrolling, lastInteractionAt, registerInteraction, setCharacterState],
  );

  const inactiveSeconds = Math.max(0, Math.floor((nowMs - lastInteractionAt) / 1000));

  return (
    <CharacterAIContext.Provider value={contextValue}>
      {children}
      {debugEnabled ? (
        <div className="pointer-events-none fixed right-3 bottom-3 z-[120] rounded-lg border border-white/20 bg-black/75 px-3 py-2 text-xs text-white/90">
          <p>Character State: {currentCharacterState}</p>
          <p>Last interaction: {inactiveSeconds}s</p>
          <p>Active section: {activeSection}</p>
          <p>Hover: {isHovering ? "yes" : "no"}</p>
          <p>Scrolling: {isScrolling ? "yes" : "no"}</p>
        </div>
      ) : null}
    </CharacterAIContext.Provider>
  );
}
