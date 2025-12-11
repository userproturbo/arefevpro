"use client";

import { create } from "zustand";

interface UIState {
  panelOpen: boolean;
  activeSection: string | null;
  setPanelOpen: (value: boolean) => void;
  setActiveSection: (value: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  panelOpen: false,
  activeSection: null,
  setPanelOpen: (panelOpen) => set({ panelOpen }),
  setActiveSection: (activeSection) => set({ activeSection }),
}));
