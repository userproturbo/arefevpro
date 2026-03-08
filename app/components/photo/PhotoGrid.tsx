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
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4 lg:gap-4">
      {photos.map((photo) => (
        <PhotoTile key={photo.id} id={photo.id} url={photo.url} onOpen={onOpen} />
      ))}
    </div>
  );
}
