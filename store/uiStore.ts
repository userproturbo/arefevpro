import { create } from "zustand";

export type Section = "photo" | "music" | "video" | "blog";

type UiState = {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
};

export const useUiStore = create<UiState>((set) => ({
  activeSection: "photo",
  setActiveSection: (section) =>
    set((state) => {
      if (state.activeSection === section) return state;
      return { activeSection: section };
    }),
}));
