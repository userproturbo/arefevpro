"use client";

type Photo = {
  id: number;
  storageKey: string;
  width: number | null;
  height: number | null;
  createdAt: string;
};

type Props = {
  photos: Photo[];
};

export default function PhotosGrid({ photos }: Props) {
  if (photos.length === 0) {
    return <p className="text-white/70">This album has no photos yet</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
        >
          <div className="flex h-28 items-center justify-center rounded-xl bg-white/5 text-sm text-white/80">
            Photo {photo.id}
          </div>
          <div className="mt-3 space-y-1 text-xs text-white/60">
            {photo.width !== null && photo.height !== null ? (
              <p>
                {photo.width} x {photo.height}
              </p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
