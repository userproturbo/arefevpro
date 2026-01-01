import { create } from "zustand";

export type SectionDrawerSection = "projects" | "photo" | "video" | "music" | "blog";

type SectionDrawerState = {
  activeSection: SectionDrawerSection | null;
  isOpen: boolean;
  open: (section: SectionDrawerSection) => void;
  close: () => void;
  switchTo: (section: SectionDrawerSection) => void;
  toggle: (section: SectionDrawerSection) => void;
};

export const useSectionDrawerStore = create<SectionDrawerState>((set) => ({
  activeSection: null,
  isOpen: false,
  open: (section) => set({ activeSection: section, isOpen: true }),
  close: () => set({ activeSection: null, isOpen: false }),
  switchTo: (section) => set({ activeSection: section, isOpen: true }),
  toggle: (section) =>
    set((state) =>
      state.isOpen && state.activeSection === section
        ? { activeSection: null, isOpen: false }
        : { activeSection: section, isOpen: true }
    ),
}));

