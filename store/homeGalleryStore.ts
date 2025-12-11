import { create } from "zustand";

interface HomeGalleryState {
  show: boolean;
  setShow: (value: boolean) => void;
}

export const useHomeGallery = create<HomeGalleryState>((set) => ({
  show: true,
  setShow: (value) => set({ show: value }),
}));
