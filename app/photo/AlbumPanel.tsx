"use client";

const albums = [
  "Portraits",
  "Travel",
  "Cinematic",
  "Street",
  "Night City",
  "Wildlife",
];

export default function AlbumPanel() {
  return (
    <div
      className="
      album-panel
      h-full
      w-full
      px-8
      py-20
      flex
      flex-col
      gap-6
      text-neutral-400
    "
    >
      {albums.map((item) => (
        <button
          key={item}
          className="album-item text-left hover:text-white transition-all duration-200"
        >
          {item}
        </button>
      ))}
    </div>
  );
}
