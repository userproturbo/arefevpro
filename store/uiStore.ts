import { create } from "zustand";

export type Section =
  | "photo"
  | "music"
  | "video"
  | "drone"
  | "blog"
  | "projects";

type UiState = {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
};

export const useUiStore = create<UiState>((set) => ({
  activeSection: "photo",
  setActiveSection: (section) => set({ activeSection: section }),
}));
