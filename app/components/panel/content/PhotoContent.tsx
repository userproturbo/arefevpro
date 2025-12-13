"use client";

export type PhotoAlbum = {
  id: string;
  title: string;
  description?: string;
  images: { src: string }[];
};

type PhotoContentProps = {
  album: PhotoAlbum;
};

export default function PhotoContent({ album }: PhotoContentProps) {
  const description =
    album.description ?? "Short description about this album. This text will be updated later.";

  return (
    <div className="flex h-full flex-col gap-5">
      <header className="space-y-2 border-b border-white/10 pb-3">
        <h3 className="text-2xl font-semibold text-white">{album.title}</h3>
        <p className="text-sm leading-relaxed text-white/60">{description}</p>
      </header>

      <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
        {album.images.map((image) => (
          <div
            key={`${album.id}-${image.src}`}
            className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] shadow-inner shadow-black/40"
            style={{ aspectRatio: "4 / 3" }}
          >
            <img
              src={image.src}
              alt={album.title}
              className="h-full w-full object-cover object-center"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
