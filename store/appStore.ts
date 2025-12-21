import { create } from "zustand";

export type AppPhase = "entrance" | "site";

interface AppStore {
  phase: AppPhase;
  enterSite: () => void;
}

// 🔧 флаг отключения интро (читается при инициализации)
const disableIntro =
  process.env.NEXT_PUBLIC_DISABLE_INTRO === "1";

export const useAppStore = create<AppStore>((set) => ({
  // если интро отключено — сразу сайт
  phase: disableIntro ? "site" : "entrance",

  enterSite: () => set({ phase: "site" }),
}));
