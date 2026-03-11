import { create } from "zustand";

export type CharacterConsoleSection =
  | "photo"
  | "music"
  | "video"
  | "blog"
  | "projects";

type CharacterConsoleState = {
  section: CharacterConsoleSection | null;
  hover: boolean;
  setSection: (section: CharacterConsoleSection | null) => void;
  setHover: (hover: boolean) => void;
};

export const useCharacterConsole = create<CharacterConsoleState>((set) => ({
  section: null,
  hover: false,
  setSection: (section) => set({ section }),
  setHover: (hover) => set({ hover }),
}));
