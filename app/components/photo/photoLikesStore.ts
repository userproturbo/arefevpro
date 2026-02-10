"use client";

import { create } from "zustand";

type PhotoLikeState = {
  liked: boolean;
  likesCount: number;
  pending: boolean;
};

type PhotoLikeSeed = {
  id: number;
  likedByMe: boolean;
  likesCount: number;
};

type OptimisticSnapshot = {
  liked: boolean;
  likesCount: number;
};

type StoreState = {
  byId: Record<number, PhotoLikeState>;
  seedPhotos: (photos: PhotoLikeSeed[]) => void;
  ensurePhoto: (photoId: number, likedByMe: boolean, likesCount: number) => void;
  optimisticToggle: (photoId: number) => OptimisticSnapshot;
  applyServerState: (photoId: number, likedByMe?: boolean, likesCount?: number) => void;
  rollback: (photoId: number, snapshot: OptimisticSnapshot) => void;
};

function clampCount(value: number) {
  return value < 0 ? 0 : value;
}

export const usePhotoLikesStore = create<StoreState>((set, get) => ({
  byId: {},

  seedPhotos: (photos) => {
    if (!Array.isArray(photos) || photos.length === 0) return;

    set((state) => {
      const nextById = { ...state.byId };

      photos.forEach((photo) => {
        if (!Number.isFinite(photo.id) || photo.id <= 0) return;
        const current = nextById[photo.id];
        if (current?.pending) return;
        nextById[photo.id] = {
          liked: !!photo.likedByMe,
          likesCount: clampCount(
            Number.isFinite(photo.likesCount) ? Math.floor(photo.likesCount) : 0
          ),
          pending: false,
        };
      });

      return { byId: nextById };
    });
  },

  ensurePhoto: (photoId, likedByMe, likesCount) => {
    if (!Number.isFinite(photoId) || photoId <= 0) return;
    const current = get().byId[photoId];
    if (current) return;

    set((state) => ({
      byId: {
        ...state.byId,
        [photoId]: {
          liked: !!likedByMe,
          likesCount: clampCount(Number.isFinite(likesCount) ? Math.floor(likesCount) : 0),
          pending: false,
        },
      },
    }));
  },

  optimisticToggle: (photoId) => {
    const current = get().byId[photoId] ?? { liked: false, likesCount: 0, pending: false };
    const snapshot = { liked: current.liked, likesCount: current.likesCount };
    const nextLiked = !current.liked;
    const nextCount = clampCount(current.likesCount + (nextLiked ? 1 : -1));

    set((state) => ({
      byId: {
        ...state.byId,
        [photoId]: {
          liked: nextLiked,
          likesCount: nextCount,
          pending: true,
        },
      },
    }));

    return snapshot;
  },

  applyServerState: (photoId, likedByMe, likesCount) => {
    const current = get().byId[photoId] ?? { liked: false, likesCount: 0, pending: false };
    set((state) => ({
      byId: {
        ...state.byId,
        [photoId]: {
          liked: typeof likedByMe === "boolean" ? likedByMe : current.liked,
          likesCount:
            typeof likesCount === "number"
              ? clampCount(Math.floor(likesCount))
              : current.likesCount,
          pending: false,
        },
      },
    }));
  },

  rollback: (photoId, snapshot) => {
    set((state) => ({
      byId: {
        ...state.byId,
        [photoId]: {
          liked: snapshot.liked,
          likesCount: clampCount(snapshot.likesCount),
          pending: false,
        },
      },
    }));
  },
}));
