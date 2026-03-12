import { create } from "zustand";
import type { SiteSection } from "@/app/types/siteSections";

type CharacterConsoleState = {
  section: SiteSection | null;
  hover: boolean;
  setSection: (section: SiteSection | null) => void;
  setHover: (hover: boolean) => void;
};

export const useCharacterConsole = create<CharacterConsoleState>((set) => ({
  section: null,
  hover: false,
  setSection: (section) => set({ section }),
  setHover: (hover) => set({ hover }),
}));
