"use client";

import { useEffect } from "react";
import { usePhotoLikesStore } from "./photoLikesStore";

type PhotoSeed = {
  id: number;
  likedByMe: boolean;
  likesCount: number;
};

type Props = {
  photos: PhotoSeed[];
};

export default function PhotoLikesHydrator({ photos }: Props) {
  const seedPhotos = usePhotoLikesStore((state) => state.seedPhotos);

  useEffect(() => {
    seedPhotos(photos);
  }, [photos, seedPhotos]);

  return null;
}
