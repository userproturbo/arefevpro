"use client";

type Photo = {
  id: string;
  url?: string;
};

export default function PhotosGrid({ photos }: { photos: Photo[] }) {
  if (!photos || photos.length === 0) {
    return (
      <p className="text-muted-foreground">
        В этом альбоме пока нет фотографий
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="aspect-square rounded border flex items-center justify-center text-sm text-muted-foreground"
        >
          Фото
        </div>
      ))}
    </div>
  );
}
