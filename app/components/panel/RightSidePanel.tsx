"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import ProjectsContent from "./content/ProjectsContent";
import PhotoContent, { type PhotoAlbum } from "./content/PhotoContent";
import PlaceholderContent from "./content/PlaceholderContent";
import { usePanel, type PanelType } from "@/store/panelStore";

type PanelConfig = {
  title: string;
  items: string[];
  renderRight: () => ReactNode;
  hideHeader?: boolean;
};

const genericPanelConfig: Record<Exclude<PanelType, "projects" | "photo" | null>, PanelConfig> = {
  video: {
    title: "Video",
    items: ["Playlist 1", "Playlist 2", "Playlist 3"],
    hideHeader: true,
    renderRight: () => (
      <PlaceholderContent
        label="Video content will be here"
        description="Drop in thumbnails, playlists, or featured clips later."
      />
    ),
  },
  music: {
    title: "Music",
    items: ["Set 1", "Set 2", "Set 3"],
    hideHeader: true,
    renderRight: () => (
      <PlaceholderContent
        label="Music content will be here"
        description="Add tracks, albums, or streaming embeds in this space."
      />
    ),
  },
  blog: {
    title: "Blog",
    items: ["Draft 1", "Draft 2", "Draft 3"],
    renderRight: () => (
      <PlaceholderContent
        label="Blog content will be here"
        description="Show posts, excerpts, or writing tools once ready."
      />
    ),
  },
};

const projectItems = ["Project 1", "Project 2", "Project 3"];
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

export default function RightSidePanel() {
  const { isOpen, panelType, closePanel } = usePanel();
  const [activeAlbumId, setActiveAlbumId] = useState<string>(photoAlbums[0]?.id ?? "");

  if (!isOpen || !panelType) {
    return null;
  }

  if (panelType === "projects") {
    return (
      <div className="absolute inset-0 z-40 flex overflow-hidden bg-[#04050a]/95 backdrop-blur-sm">
        <aside className="w-[36%] max-w-xl overflow-y-auto border-r border-white/10 bg-white/[0.04] px-8 py-10">
          <ul className="space-y-3 text-xl text-white/80">
            {projectItems.map((item) => (
              <li
                key={item}
                className="rounded-lg border border-white/5 bg-white/5 px-4 py-3 shadow-inner shadow-black/40"
              >
                {item}
              </li>
            ))}
          </ul>
        </aside>

        <section className="flex-1 overflow-y-auto px-10 py-10">
          <ProjectsContent />
        </section>
      </div>
    );
  }

  if (panelType === "photo") {
    const activeAlbum =
      photoAlbums.find((album) => album.id === activeAlbumId) ?? photoAlbums[0];

    return (
      <div className="absolute inset-0 z-40 flex overflow-hidden bg-[#04050a]/95 backdrop-blur-sm">
        <aside className="w-[36%] max-w-xl overflow-y-auto border-r border-white/10 bg-white/[0.04] px-8 py-10">
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
        </aside>

        <section className="flex-1 overflow-y-auto px-10 py-10">
          {activeAlbum ? <PhotoContent album={activeAlbum} /> : null}
        </section>
      </div>
    );
  }

  const config = genericPanelConfig[panelType];

  if (!config) {
    return null;
  }

  const showHeader = !config.hideHeader;

  return (
    <div className="absolute inset-0 z-40 flex overflow-hidden bg-[#04050a]/95 backdrop-blur-sm">
      <aside className="w-[36%] max-w-xl overflow-y-auto border-r border-white/10 bg-white/[0.04] px-8 py-10">
        {showHeader ? (
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-white/50">Section</p>
              <h2 className="text-3xl font-semibold capitalize text-white">{config.title}</h2>
            </div>
            <button
              type="button"
              onClick={closePanel}
              className="rounded-md border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/10"
            >
              Close
            </button>
          </div>
        ) : null}

        <ul className={`space-y-3 text-lg text-white/80 ${showHeader ? "" : "mt-2"}`}>
          {config.items.map((item) => (
            <li
              key={item}
              className="rounded-lg border border-white/5 bg-white/5 px-4 py-3 shadow-inner shadow-black/40"
            >
              {item}
            </li>
          ))}
        </ul>
      </aside>

      <section className="flex-1 overflow-y-auto px-10 py-10">
        {config.renderRight()}
      </section>
    </div>
  );
}
