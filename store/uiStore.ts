import { create } from "zustand";
import type { SiteSection } from "@/app/types/siteSections";

type UIState = {
  activeSection: SiteSection | null;
  setActiveSection: (section: SiteSection | null) => void;
};

export const useUIStore = create<UIState>((set) => ({
  activeSection: null,
  setActiveSection: (section) => set({ activeSection: section }),
}));
