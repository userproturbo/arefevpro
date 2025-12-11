"use client";

import { usePanel } from "@/store/panelStore";

const items = [
  { type: "projects", label: "PROJECTS" },
  { type: "photo", label: "PHOTO" },
  { type: "video", label: "VIDEO" },
  { type: "music", label: "MUSIC" },
  { type: "blog", label: "BLOG" },
] as const;

export default function SidebarNav() {
  const { openPanel } = usePanel();

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-28 flex-col px-6 py-12">
      <nav aria-label="Primary">
        <ul>
          {items.map(({ type, label }) => (
            <li key={type}>
              <button
                type="button"
                className="block"
                onClick={() => openPanel(type)}
              >
                <div className="menu-word">
                  {label.split("").map((char, index) => (
                    <span
                      key={`${label}-${index}`}
                      style={{ transitionDelay: `${(label.length - index) * 60}ms` }}
                      className="menu-letter"
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
