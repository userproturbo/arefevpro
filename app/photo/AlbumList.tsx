const albums = [
  "Portraits",
  "Travel",
  "Cinematic",
  "Street",
  "Night City",
  "Wildlife",
];

export default function AlbumList() {
  const selectedAlbum = albums[0];

  return (
    <div className="flex flex-col gap-6 text-neutral-400">
      {albums.map((album) => (
        <div key={album} className={album === selectedAlbum ? "text-white" : undefined}>
          {album}
        </div>
      ))}
    </div>
  );
}
