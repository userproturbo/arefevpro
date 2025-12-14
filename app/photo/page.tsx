"use client";

import { useEffect, useState } from "react";
import SectionLayout from "../components/section/SectionLayout";
import PhotoContent, { type PhotoAlbum } from "../components/panel/content/PhotoContent";

const albumDescription = "Short description about this album. This text will be updated later.";

const photoAlbums: PhotoAlbum[] = [
  {
    id: "album-01",
    title: "Album 01",
    description: albumDescription,
    images: [
      {
        src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      },
      {
        src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80&sat=-20",
      },
      {
        src: "https://images.unsplash.com/photo-1471357674240-e1a485acb3e1?auto=format&fit=crop&w=1200&q=80",
      },
      {
        src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
      },
      {
        src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80&sat=-50",
      },
    ],
  },
  {
    id: "album-02",
    title: "Album 02",
    description: albumDescription,
    images: [
      {
        src: "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1200&q=80",
      },
      {
        src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
      },
      {
        src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80&sat=-30",
      },
      {
        src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80&sat=-60",
      },
      {
        src: "https://images.unsplash.com/photo-1471357674240-e1a485acb3e1?auto=format&fit=crop&w=1200&q=80&sat=-20",
      },
    ],
  },
  {
    id: "album-03",
    title: "Album 03",
    description: albumDescription,
    images: [
      {
        src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80&sat=-35",
      },
      {
        src: "https://images.unsplash.com/photo-1471357674240-e1a485acb3e1?auto=format&fit=crop&w=1200&q=80&sat=-10",
      },
      {
        src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80&sat=-20",
      },
      {
        src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80&sat=-50",
      },
      {
        src: "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1200&q=80&sat=-5",
      },
    ],
  },
];

export default function PhotoPage() {
  const [activeAlbumId, setActiveAlbumId] = useState<string>(photoAlbums[0]?.id ?? "");

  useEffect(() => {
    const exists = photoAlbums.some((album) => album.id === activeAlbumId);
    if (!exists && photoAlbums[0]) {
      setActiveAlbumId(photoAlbums[0].id);
    }
  }, [activeAlbumId]);

  const activeAlbum = photoAlbums.find((album) => album.id === activeAlbumId) ?? photoAlbums[0];
  const sidebar = (
    <ul className="space-y-3 text-xl text-white/80">
      {photoAlbums.map((album) => {
        const isActive = album.id === activeAlbum?.id;
        return (
          <li key={album.id}>
            <button
              type="button"
              onClick={() => setActiveAlbumId(album.id)}
              className={`w-full rounded-lg px-4 py-3 text-left font-semibold transition ${
                isActive
                  ? "bg-white/[0.08] text-white shadow-inner shadow-black/40"
                  : "text-white/70 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              {album.title}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <SectionLayout
      title={activeAlbum?.title ?? "Album"}
      description={activeAlbum?.description ?? albumDescription}
      sidebar={sidebar}
    >
      {activeAlbum ? <PhotoContent album={activeAlbum} showHeader={false} /> : null}
    </SectionLayout>
  );
}
