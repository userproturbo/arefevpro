import { create } from "zustand";

export type Section =
  | "photo"
  | "music"
  | "video"
  | "drone"
  | "blog"
  | "projects";

type UIState = {
  activeSection: Section | null;
  setActiveSection: (section: Section | null) => void;
};

export const useUIStore = create<UIState>((set) => ({
  activeSection: null,
  setActiveSection: (section) => set({ activeSection: section }),
}));
