import type { Section } from "@/store/uiStore";

export type CharacterState =
  | "idle"
  | "curious"
  | "thinking"
  | "listening"
  | "celebrating"
  | "focused"
  | "sleepy"
  | "reacting";

export type CharacterAIInteractionType =
  | "interaction"
  | "hover_start"
  | "hover_end"
  | "scroll"
  | "section_change"
  | "content_loaded"
  | "like"
  | "comment_posted";

export type CharacterAITransientState = {
  state: CharacterState;
  until: number;
};

export const CHARACTER_STATE_PRIORITY: Record<CharacterState, number> = {
  celebrating: 100,
  reacting: 90,
  focused: 80,
  listening: 70,
  curious: 60,
  thinking: 50,
  idle: 40,
  sleepy: 30,
};

export const CHARACTER_IDLE_THRESHOLDS_MS = {
  curious: 15_000,
  thinking: 30_000,
  sleepy: 60_000,
} as const;

export const CHARACTER_STATE_DURATION_MS: Partial<Record<CharacterState, number>> = {
  celebrating: 1_500,
  reacting: 1_000,
  curious: 4_000,
  focused: 1_100,
};

export const SECTION_BASE_STATE: Record<Section, CharacterState> = {
  photo: "focused",
  music: "listening",
  video: "focused",
  blog: "thinking",
};
