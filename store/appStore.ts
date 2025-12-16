import { create } from "zustand";

export type AppPhase = "entrance" | "site";

interface AppStore {
  phase: AppPhase;
  enterSite: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  phase: "entrance",
  enterSite: () => set({ phase: "site" }),
}));
