"use client";

import Link from "next/link";
import { usePanel, type PanelType } from "@/store/panelStore";

type NavItem = { label: string; type: Exclude<PanelType, null> | "home" };

const navItems: NavItem[] = [
  { label: "HOME", type: "home" },
  { label: "PROJECTS", type: "projects" },
  { label: "PHOTO", type: "photo" },
  { label: "VIDEO", type: "video" },
  { label: "MUSIC", type: "music" },
  { label: "BLOG", type: "blog" },
];

export default function SidebarNav() {
  const { openPanel, closePanel, setActiveSection } = usePanel();

  return (
    <aside className="fixed left-0 top-0 z-60 flex h-screen w-20 flex-col overflow-y-auto px-4 py-8">
      <nav aria-label="Primary">
        <ul>
          {navItems.map((item) => {
            const content = (
              <div className="menu-word">
                {item.label.split("").map((char, index) => (
                  <span
                    key={`${item.label}-${index}`}
                    style={{ transitionDelay: `${(item.label.length - index) * 60}ms` }}
                    className="menu-letter"
                  >
                    {char}
                  </span>
                ))}
              </div>
            );

            return (
              <li key={item.label}>
                {item.type === "home" ? (
                  <Link
                    href="/"
                    className="block"
                    onClick={() => {
                      closePanel();
                      setActiveSection("home");
                    }}
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="block"
                    onClick={() => openPanel(item.type)}
                  >
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
