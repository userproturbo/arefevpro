"use client";

export type PhotoAlbum = {
  id: string;
  title: string;
  images: { src: string; ratio: string }[];
};

type PhotoContentProps = {
  album: PhotoAlbum;
};

export default function PhotoContent({ album }: PhotoContentProps) {
  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-baseline gap-3">
        <h3 className="text-2xl font-semibold text-white">{album.title}</h3>
        <span className="text-xs uppercase tracking-wide text-white/50">Photo album</span>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3">
        {album.images.map((image) => (
          <div
            key={`${album.id}-${image.src}`}
            className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] shadow-inner shadow-black/40"
            style={{ aspectRatio: image.ratio }}
          >
            <img src={image.src} alt={album.title} className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}
