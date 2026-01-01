import { create } from "zustand";

export type SectionDrawerSection = "projects" | "photo" | "video" | "music" | "blog";

type SectionDrawerState = {
  activeSection: SectionDrawerSection | null;
  open: (section: SectionDrawerSection) => void;
  close: () => void;
  switchTo: (section: SectionDrawerSection) => void;
  toggle: (section: SectionDrawerSection) => void;
};

export const useSectionDrawerStore = create<SectionDrawerState>((set) => ({
  activeSection: null,
  open: (section) => set({ activeSection: section }),
  close: () => set({ activeSection: null }),
  switchTo: (section) => set({ activeSection: section }),
  toggle: (section) =>
    set((state) =>
      state.activeSection === section
        ? { activeSection: null }
        : { activeSection: section }
    ),
}));
