"use client";

import type { ReactNode } from "react";
import ProjectsContent from "./content/ProjectsContent";
import PhotoContent from "./content/PhotoContent";
import PlaceholderContent from "./content/PlaceholderContent";
import { usePanel, type PanelType } from "@/store/panelStore";

type PanelConfig = {
  title: string;
  items: string[];
  renderRight: () => ReactNode;
};

const panelConfig: Record<Exclude<PanelType, null>, PanelConfig> = {
  projects: {
    title: "Projects",
    items: ["Project 1", "Project 2", "Project 3"],
    renderRight: () => <ProjectsContent />,
  },
  photo: {
    title: "Photo",
    items: ["Album 1", "Album 2", "Album 3"],
    renderRight: () => <PhotoContent />,
  },
  video: {
    title: "Video",
    items: ["Playlist 1", "Playlist 2", "Playlist 3"],
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

export default function RightSidePanel() {
  const { isOpen, panelType, closePanel } = usePanel();

  if (!isOpen || !panelType) {
    return null;
  }

  const config = panelConfig[panelType];

  if (!config) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-40 flex bg-[#04050a]/95 backdrop-blur-sm">
      <aside className="w-[36%] max-w-xl border-r border-white/10 bg-white/[0.04] px-8 py-10">
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

        <ul className="space-y-3 text-lg text-white/80">
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

      <section className="flex-1 overflow-hidden px-10 py-10">
        {config.renderRight()}
      </section>
    </div>
  );
}
