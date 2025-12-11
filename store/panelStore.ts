import { create } from "zustand";

export type PanelType = "projects" | "photo" | "video" | "music" | "blog" | null;

interface PanelState {
  isOpen: boolean;
  panelType: PanelType;
  openPanel: (type: PanelType) => void;
  closePanel: () => void;
  setActiveSection: (type: PanelType) => void;
}

export const usePanel = create<PanelState>((set) => ({
  isOpen: false,
  panelType: null,
  openPanel: (type) => set({ isOpen: true, panelType: type }),
  closePanel: () => set({ isOpen: false, panelType: null }),
  setActiveSection: (type) => set({ panelType: type, isOpen: type !== null }),
}));
