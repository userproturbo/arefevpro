"use client";

import Link from "next/link";
import { usePanel, type PanelType } from "@/store/panelStore";

type NavItem = { label: string; href: string } | { label: string; type: Exclude<PanelType, null> };

const items: NavItem[] = [
  { label: "HOME", href: "/" },
  { label: "PROJECTS", type: "projects" },
  { label: "PHOTO", type: "photo" },
  { label: "VIDEO", type: "video" },
  { label: "MUSIC", type: "music" },
  { label: "BLOG", type: "blog" },
];

export default function SidebarNav() {
  const { openPanel } = usePanel();

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-28 flex-col px-6 py-12">
      <nav aria-label="Primary">
        <ul>
          {items.map((item) => {
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
                {"href" in item ? (
                  <Link href={item.href} className="block">
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
