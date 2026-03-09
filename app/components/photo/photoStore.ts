"use client";

import { create } from "zustand";

export type PhotoEntity = {
  id: number;
  url: string;
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
};

type PhotoMap = Record<number, PhotoEntity>;

type PhotoStoreState = {
  photos: PhotoMap;
  order: number[];
  activePhotoId: number | null;
  setPhotos: (photos: PhotoEntity[]) => void;
  setActivePhoto: (id: number | null) => void;
  toggleLike: (id: number) => void;
  incrementComments: (id: number) => void;
  setPhoto: (id: number, photo: PhotoEntity) => void;
};

function clampCount(value: number) {
  if (!Number.isFinite(value)) return 0;
  return value < 0 ? 0 : Math.floor(value);
}

export const usePhotoStore = create<PhotoStoreState>((set) => ({
  photos: {},
  order: [],
  activePhotoId: null,

  setPhotos: (photos) =>
    set({
      photos: Object.fromEntries(
        photos
          .filter((photo) => Number.isFinite(photo.id) && photo.id > 0 && typeof photo.url === "string")
          .map((photo) => [
            photo.id,
            {
              id: photo.id,
              url: photo.url,
              likesCount: clampCount(photo.likesCount),
              commentsCount: clampCount(photo.commentsCount),
              likedByMe: !!photo.likedByMe,
            } satisfies PhotoEntity,
          ])
      ),
      order: photos
        .filter((photo) => Number.isFinite(photo.id) && photo.id > 0)
        .map((photo) => photo.id),
      activePhotoId: null,
    }),

  setActivePhoto: (id) => set({ activePhotoId: id }),

  toggleLike: (id) =>
    set((state) => {
      const photo = state.photos[id];
      if (!photo) return state;

      return {
        photos: {
          ...state.photos,
          [id]: {
            ...photo,
            likedByMe: !photo.likedByMe,
            likesCount: clampCount(photo.likesCount + (photo.likedByMe ? -1 : 1)),
          },
        },
      };
    }),

  incrementComments: (id) =>
    set((state) => {
      const photo = state.photos[id];
      if (!photo) return state;

      return {
        photos: {
          ...state.photos,
          [id]: {
            ...photo,
            commentsCount: clampCount(photo.commentsCount + 1),
          },
        },
      };
    }),

  setPhoto: (id, photo) =>
    set((state) => ({
      photos: {
        ...state.photos,
        [id]: {
          id: photo.id,
          url: photo.url,
          likesCount: clampCount(photo.likesCount),
          commentsCount: clampCount(photo.commentsCount),
          likedByMe: !!photo.likedByMe,
        },
      },
    })),
}));

export const photoStore = {
  usePhoto: (id: number) =>
    usePhotoStore((state) =>
      state.photos[id] ?? {
        id,
        url: "",
        likesCount: 0,
        commentsCount: 0,
        likedByMe: false,
      }
    ),
  setPhotos: (photos: PhotoEntity[]) => usePhotoStore.getState().setPhotos(photos),
  setActivePhoto: (id: number | null) => usePhotoStore.getState().setActivePhoto(id),
  toggleLike: (id: number) => usePhotoStore.getState().toggleLike(id),
  incrementComments: (id: number) => usePhotoStore.getState().incrementComments(id),
  setPhoto: (id: number, photo: PhotoEntity) => usePhotoStore.getState().setPhoto(id, photo),
};
