import { create } from "zustand";

interface UIState {
  panelOpen: boolean;
  activeSection: string | null;
  openPanel: (section: string) => void;
  closePanel: () => void;
  togglePanel: (section: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  panelOpen: false,
  activeSection: null,

  openPanel: (section) =>
    set({ panelOpen: true, activeSection: section }),

  closePanel: () =>
    set({ panelOpen: false, activeSection: null }),

  togglePanel: (section) =>
    set((state) => {
      if (state.activeSection === section) {
        return { panelOpen: !state.panelOpen };
      }
      return { panelOpen: true, activeSection: section };
    }),
}));
