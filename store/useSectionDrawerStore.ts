import { create } from "zustand";
import type { SiteSection } from "@/app/types/siteSections";

type SectionDrawerState = {
  activeSection: SiteSection | null;
  open: (section: SiteSection) => void;
  close: () => void;
  switchTo: (section: SiteSection) => void;
  toggle: (section: SiteSection) => void;
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
