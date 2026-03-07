import type { Section } from "@/store/uiStore";
import {
  CHARACTER_IDLE_THRESHOLDS_MS,
  SECTION_BASE_STATE,
  type CharacterAITransientState,
  type CharacterState,
} from "./characterStates";

export type BehaviorEngineInput = {
  now: number;
  lastInteractionAt: number;
  isHovering: boolean;
  isScrolling: boolean;
  scrollSpeed: number;
  activeSection: Section;
  transientState: CharacterAITransientState | null;
};

export function resolveCharacterState({
  now,
  lastInteractionAt,
  isHovering,
  isScrolling,
  scrollSpeed,
  activeSection,
  transientState,
}: BehaviorEngineInput): CharacterState {
  if (transientState && now < transientState.until) {
    return transientState.state;
  }

  if (isScrolling) {
    return scrollSpeed > 2.2 ? "reacting" : "focused";
  }

  if (isHovering) {
    return "curious";
  }

  const inactiveFor = Math.max(0, now - lastInteractionAt);
  if (inactiveFor >= CHARACTER_IDLE_THRESHOLDS_MS.sleepy) {
    return "sleepy";
  }
  if (inactiveFor >= CHARACTER_IDLE_THRESHOLDS_MS.thinking) {
    return "thinking";
  }
  if (inactiveFor >= CHARACTER_IDLE_THRESHOLDS_MS.curious) {
    return "curious";
  }

  return SECTION_BASE_STATE[activeSection] ?? "idle";
}

export function resolveSectionByPathname(pathname: string, fallback: Section): Section {
  if (pathname === "/" || pathname.length === 0) return fallback;
  if (pathname === "/photo" || pathname.startsWith("/photo/") || pathname === "/photos" || pathname.startsWith("/photos/")) {
    return "photo";
  }
  if (pathname === "/music" || pathname.startsWith("/music/")) return "music";
  if (pathname === "/video" || pathname.startsWith("/video/")) return "video";
  if (pathname === "/drone" || pathname.startsWith("/drone/")) return "video";
  if (pathname === "/blog" || pathname.startsWith("/blog/") || pathname === "/post" || pathname.startsWith("/post/")) {
    return "blog";
  }
  return fallback;
}

export function getNextBehaviorDeadlineMs(now: number, lastInteractionAt: number, transientState: CharacterAITransientState | null): number | null {
  const deadlines: number[] = [];

  if (transientState && transientState.until > now) {
    deadlines.push(transientState.until - now);
  }

  const inactiveFor = Math.max(0, now - lastInteractionAt);
  if (inactiveFor < CHARACTER_IDLE_THRESHOLDS_MS.curious) {
    deadlines.push(CHARACTER_IDLE_THRESHOLDS_MS.curious - inactiveFor);
  } else if (inactiveFor < CHARACTER_IDLE_THRESHOLDS_MS.thinking) {
    deadlines.push(CHARACTER_IDLE_THRESHOLDS_MS.thinking - inactiveFor);
  } else if (inactiveFor < CHARACTER_IDLE_THRESHOLDS_MS.sleepy) {
    deadlines.push(CHARACTER_IDLE_THRESHOLDS_MS.sleepy - inactiveFor);
  }

  if (deadlines.length === 0) return null;
  return Math.min(...deadlines);
}
