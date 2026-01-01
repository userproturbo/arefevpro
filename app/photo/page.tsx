"use client";

import SectionLayout from "../components/section/SectionLayout";
import PhotoContent, { type PhotoAlbum } from "../components/panel/content/PhotoContent";

const albumDescription = "Short description about this album. This text will be updated later.";

const photoAlbums: PhotoAlbum[] = [
  {
    id: "album-01",
    title: "Album 01",
    description: albumDescription,
    images: [
      { src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80" },
      { src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80&sat=-20" },
      { src: "https://images.unsplash.com/photo-1471357674240-e1a485acb3e1?auto=format&fit=crop&w=1200&q=80" },
      { src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80" },
      { src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80&sat=-50" },
    ],
  },
  {
    id: "album-02",
    title: "Album 02",
    description: albumDescription,
    images: [
      { src: "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1200&q=80" },
      { src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80" },
      { src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80&sat=-30" },
      { src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80&sat=-60" },
      { src: "https://images.unsplash.com/photo-1471357674240-e1a485acb3e1?auto=format&fit=crop&w=1200&q=80&sat=-20" },
    ],
  },
  {
    id: "album-03",
    title: "Album 03",
    description: albumDescription,
    images: [
      { src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80&sat=-35" },
      { src: "https://images.unsplash.com/photo-1471357674240-e1a485acb3e1?auto=format&fit=crop&w=1200&q=80&sat=-10" },
      { src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80&sat=-20" },
      { src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80&sat=-50" },
      { src: "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1200&q=80&sat=-5" },
    ],
  },
];

export default function PhotoPage() {
  const firstAlbum = photoAlbums[0];
  const activeAlbum = firstAlbum;

  return (
    <SectionLayout
      title={activeAlbum?.title ?? "Album"}
      description={activeAlbum?.description ?? albumDescription}
    >
      {activeAlbum && <PhotoContent album={activeAlbum} showHeader={false} />}
    </SectionLayout>
  );
}
