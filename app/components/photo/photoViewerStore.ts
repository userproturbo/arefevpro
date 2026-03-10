"use client";

import { create } from "zustand";

type PhotoViewerState = {
  activeIndex: number;
  total: number;
  setCount: (count: number) => void;
  setIndex: (index: number) => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
};

function clampIndex(index: number, total: number) {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(index, total - 1));
}

export const usePhotoViewerStore = create<PhotoViewerState>((set) => ({
  activeIndex: 0,
  total: 0,

  setCount: (count) =>
    set((state) => {
      const total = Math.max(0, Math.floor(count));
      return {
        total,
        activeIndex: clampIndex(state.activeIndex, total),
      };
    }),

  setIndex: (index) =>
    set((state) => ({
      activeIndex: clampIndex(index, state.total),
    })),

  next: () =>
    set((state) => ({
      activeIndex: clampIndex(state.activeIndex + 1, state.total),
    })),

  prev: () =>
    set((state) => ({
      activeIndex: clampIndex(state.activeIndex - 1, state.total),
    })),

  reset: () =>
    set({
      activeIndex: 0,
      total: 0,
    }),
}));
