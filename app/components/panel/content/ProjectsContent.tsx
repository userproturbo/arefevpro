"use client";

const projects = [
  { title: "Project 1", summary: "A clean placeholder for a featured build." },
  { title: "Project 2", summary: "Swap in visuals or copy once ready." },
  { title: "Project 3", summary: "Room for notes, tags, or a CTA later." },
  { title: "Project 4", summary: "Use as a second row preview block." },
];

export default function ProjectsContent() {
  return (
    <div className="flex h-full flex-col">
      <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <article
            key={project.title}
            className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.04] p-5 shadow-inner shadow-black/40"
          >
            <div>
              <p className="text-xs uppercase tracking-wide text-white/60">Preview</p>
              <h4 className="mt-1 text-lg font-semibold text-white">{project.title}</h4>
            </div>
            <p className="mt-4 text-sm text-white/60">{project.summary}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
