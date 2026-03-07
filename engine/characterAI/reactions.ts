import type { CharacterState } from "./characterStates";

export const CHARACTER_AI_EVENT = "character-ai:reaction";

export type CharacterAIReactionType =
  | "like"
  | "comment_posted"
  | "content_loaded"
  | "section_change";

export type CharacterAIReactionDetail = {
  type: CharacterAIReactionType;
  payload?: Record<string, unknown>;
};

export type CharacterAIReactionTransition = {
  state: CharacterState;
  durationMs: number;
};

export function mapReactionToTransition(type: CharacterAIReactionType): CharacterAIReactionTransition {
  if (type === "like") {
    return { state: "celebrating", durationMs: 1_500 };
  }

  if (type === "comment_posted") {
    return { state: "reacting", durationMs: 1_000 };
  }

  if (type === "content_loaded") {
    return { state: "focused", durationMs: 900 };
  }

  return { state: "reacting", durationMs: 1_000 };
}

export function emitCharacterAIReaction(type: CharacterAIReactionType, payload?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<CharacterAIReactionDetail>(CHARACTER_AI_EVENT, {
      detail: { type, payload },
    }),
  );
}
