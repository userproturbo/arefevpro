"use client";

import { useContext } from "react";
import { CharacterAIContext } from "./CharacterAIProvider";

export function useCharacterAI() {
  const value = useContext(CharacterAIContext);
  if (!value) {
    throw new Error("useCharacterAI must be used within CharacterAIProvider");
  }
  return value;
}
