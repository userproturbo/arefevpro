"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import ProjectsContent from "./content/ProjectsContent";
import PhotoContent from "./content/PhotoContent";
import PlaceholderContent from "./content/PlaceholderContent";
import { usePanel, type PanelType } from "@/store/panelStore";

type Project = {
  id: string;
  name: string;
  description: string;
  stack: string;
  links: { live: string; github: string };
  visuals: string[];
};

type PanelConfig = {
  title: string;
  items: string[];
  renderRight: () => ReactNode;
};

const panelConfig: Record<Exclude<PanelType, "projects" | null>, PanelConfig> = {
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

const projects: Project[] = [
  {
    id: "signal-shift",
    name: "Signal Shift",
    description: "Adaptive dashboard concept for tracking momentum across creative sprints and releases.",
    stack: "Next.js • TypeScript • Zustand • Tailwind",
    links: { live: "#", github: "#" },
    visuals: [
      "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: "midnight-notes",
    name: "Midnight Notes",
    description: "Minimal writing space that keeps drafts organized while you stay in flow.",
    stack: "React • Zustand • Markdown • Cloud storage",
    links: { live: "#", github: "#" },
    visuals: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80&sat=-40",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: "kinetic-reels",
    name: "Kinetic Reels",
    description: "Showcase builder for short-form videos with quick sequencing and export presets.",
    stack: "Next.js • Framer Motion-lite • Vercel",
    links: { live: "#", github: "#" },
    visuals: [
      "https://images.unsplash.com/photo-1471357674240-e1a485acb3e1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80&sat=-25",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80&sat=-30",
    ],
  },
];

export default function RightSidePanel() {
  const { isOpen, panelType, closePanel } = usePanel();
  const [activeProjectId, setActiveProjectId] = useState<string>(projects[0]?.id ?? "");
  const [isProjectTransitioning, setIsProjectTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!isOpen || !panelType) {
    return null;
  }

  useEffect(() => {
    if (panelType !== "projects") {
      setIsProjectTransitioning(false);
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
      return;
    }

    if (!projects.find((project) => project.id === activeProjectId)) {
      setActiveProjectId(projects[0]?.id ?? "");
    }
  }, [panelType, activeProjectId]);

  useEffect(() => {
    if (panelType !== "projects") {
      return undefined;
    }

    const handler = (event: KeyboardEvent) => {
      if (!projects.length) return;
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown" && event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
      }

      const currentIndex = projects.findIndex((project) => project.id === activeProjectId);
      if (currentIndex === -1) return;

      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        const prevIndex = (currentIndex - 1 + projects.length) % projects.length;
        handleProjectSelect(projects[prevIndex].id);
      } else if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        const nextIndex = (currentIndex + 1) % projects.length;
        handleProjectSelect(projects[nextIndex].id);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [panelType, activeProjectId]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const handleProjectSelect = (projectId: string) => {
    if (projectId === activeProjectId) return;
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    setIsProjectTransitioning(true);
    transitionTimeoutRef.current = setTimeout(() => {
      setActiveProjectId(projectId);
      setIsProjectTransitioning(false);
      transitionTimeoutRef.current = null;
    }, 160);
  };

  if (panelType === "projects") {
    const activeProject =
      projects.find((project) => project.id === activeProjectId) ?? projects[0];

    return (
      <div className="absolute inset-0 z-40 flex overflow-hidden bg-[#04050a]/95 backdrop-blur-sm">
        <aside className="w-[36%] max-w-xl overflow-y-auto border-r border-white/10 bg-white/[0.04] px-8 py-10">
          <ul className="space-y-3">
            {projects.map((project) => {
              const isActive = project.id === activeProject?.id;
              return (
                <li key={project.id}>
                  <button
                    type="button"
                    onClick={() => handleProjectSelect(project.id)}
                    className={`w-full rounded-lg px-4 py-4 text-left text-2xl font-semibold transition ${
                      isActive
                        ? "bg-white/[0.08] text-white shadow-inner shadow-black/40"
                        : "text-white/70 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    {project.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <section className="flex-1 overflow-y-auto px-10 py-10">
          <ProjectsContent project={activeProject} isTransitioning={isProjectTransitioning} />
        </section>
      </div>
    );
  }

  const config = panelConfig[panelType];

  if (!config) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-40 flex overflow-hidden bg-[#04050a]/95 backdrop-blur-sm">
      <aside className="w-[36%] max-w-xl overflow-y-auto border-r border-white/10 bg-white/[0.04] px-8 py-10">
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

      <section className="flex-1 overflow-y-auto px-10 py-10">
        {config.renderRight()}
      </section>
    </div>
  );
}
