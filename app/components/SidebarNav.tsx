"use client";

import Link from "next/link";
import { useUIStore } from "@/lib/uiStore";

const items = [
  { href: "/", label: "HOME" },
  { href: "/projects", label: "PROJECTS" },
  { href: "/photo", label: "PHOTO" },
  { href: "/video", label: "VIDEO" },
  { href: "/music", label: "MUSIC" },
  { href: "/blog", label: "BLOG" },
];

export default function SidebarNav() {
  const togglePanel = useUIStore((s) => s.togglePanel);
  const closePanel = useUIStore((s) => s.closePanel);

  const handleClick = (label: string) => {
    if (label === "HOME") {
      closePanel();
    } else {
      togglePanel(label.toLowerCase());
    }
  };

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-28 flex-col px-6 py-12">
      <nav aria-label="Primary">
        <ul>
          {items.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className="block" onClick={() => handleClick(label)}>
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
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
