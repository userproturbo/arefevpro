import { create } from "zustand";

export type PanelType = "projects" | "photo" | "video" | "music" | "blog" | null;
type ActiveSection = "home" | Exclude<PanelType, null>;

interface PanelState {
  isOpen: boolean;
  panelType: PanelType;
  activeSection: ActiveSection;
  openPanel: (type: Exclude<PanelType, null>) => void;
  closePanel: () => void;
  setActiveSection: (section: ActiveSection) => void;
}

export const usePanel = create<PanelState>((set) => ({
  isOpen: false,
  panelType: null,
  activeSection: "home",
  openPanel: (type) => set({ isOpen: true, panelType: type, activeSection: type }),
  closePanel: () => set({ isOpen: false, panelType: null }),
  setActiveSection: (section) => set({ activeSection: section }),
}));
