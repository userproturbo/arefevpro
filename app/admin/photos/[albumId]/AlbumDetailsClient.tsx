"use client";

type Photo = {
  id: number;
  storageKey: string;
  width?: number | null;
  height?: number | null;
  createdAt: string;
};

type Album = {
  id: number;
  title: string;
  description?: string | null;
  photos: Photo[];
};

type Props = {
  album: Album;
};

export default function AlbumDetailsClient({ album }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{album.title}</h1>
        {album.description && (
          <p className="text-muted-foreground mt-1">
            {album.description}
          </p>
        )}
      </div>

      <div className="border rounded-md p-4 text-sm text-muted-foreground">
        Фото в альбоме: {album.photos.length}
      </div>

      {album.photos.length === 0 ? (
        <p className="text-muted-foreground">
          В этом альбоме пока нет фотографий
        </p>
      ) : (
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {album.photos.map((photo) => (
            <li
              key={photo.id}
              className="border rounded-md p-2 text-xs text-muted-foreground"
            >
              <div>Photo #{photo.id}</div>
              <div>
                {photo.width}×{photo.height}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
