import { create } from "zustand";
import type { NavigationCharacter } from "@/lib/characterNavigation";

interface NavigationState {
  isOpen: boolean;
  selectedCharacter: NavigationCharacter | null;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setSelectedCharacter: (character: NavigationCharacter | null) => void;
}

export const useNavigation = create<NavigationState>((set) => ({
  isOpen: false,
  selectedCharacter: null,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () =>
    set((state) => ({
      isOpen: !state.isOpen,
    })),
  setSelectedCharacter: (character) => set({ selectedCharacter: character }),
}));
