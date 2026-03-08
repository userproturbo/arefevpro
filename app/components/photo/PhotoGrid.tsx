"use client";

import PhotoTile from "./PhotoTile";

type Photo = {
  id: number;
  url: string;
};

type PhotoGridProps = {
  photos: Photo[];
  onOpen: (photoId: number) => void;
};

export default function PhotoGrid({ photos, onOpen }: PhotoGridProps) {
  return (
    <div className="photo-grid-layout grid gap-2 md:gap-3 lg:gap-4">
      {photos.map((photo) => (
        <PhotoTile key={photo.id} id={photo.id} url={photo.url} onOpen={onOpen} />
      ))}
    </div>
  );
}
