"use client";

import PhotoLikeButton from "./PhotoLikeButton";

type Props = {
  photoId: number;
  initialCount: number;
  initialLiked?: boolean;
  className?: string;
};

export default function PhotoTileLikeButton({
  photoId,
  initialCount,
  initialLiked,
  className,
}: Props) {
  return (
    <PhotoLikeButton
      photoId={photoId}
      initialCount={initialCount}
      initialLiked={initialLiked}
      size="sm"
      variant="overlay"
      className={className}
    />
  );
}
