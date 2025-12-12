"use client";

type ProjectContentProps = {
  project: {
    name: string;
    description: string;
    stack: string;
    links: { live: string; github: string };
    visuals: string[];
  };
  isTransitioning: boolean;
};

export default function ProjectsContent({ project, isTransitioning }: ProjectContentProps) {
  return (
    <div
      className="flex h-full flex-col gap-8"
      style={{
        opacity: isTransitioning ? 0 : 1,
        transform: isTransitioning ? "translateY(8px)" : "translateY(0)",
        transition: "opacity 180ms ease, transform 180ms ease",
      }}
    >
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline gap-3">
          <h2 className="text-3xl font-semibold text-white">{project.name}</h2>
          <span className="text-sm text-white/60">{project.stack}</span>
        </div>
        <p className="max-w-3xl text-white/70">{project.description}</p>
        <div className="flex flex-wrap gap-3">
          <a
            href={project.links.live}
            className="rounded-md border border-white/15 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            target="_blank"
            rel="noreferrer"
          >
            View live
          </a>
          <a
            href={project.links.github}
            className="rounded-md border border-white/15 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
        {project.visuals.map((src, index) => (
          <div
            key={`${project.name}-visual-${index}`}
            className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] shadow-inner shadow-black/40"
          >
            <img src={src} alt={`${project.name} visual ${index + 1}`} className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}
