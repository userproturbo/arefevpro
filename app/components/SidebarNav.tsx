"use client";

import Link from "next/link";

const items = [
  { href: "/", label: "HOME" },
  { href: "/projects", label: "PROJECTS" },
  { href: "/photo", label: "PHOTO" },
  { href: "/video", label: "VIDEO" },
  { href: "/music", label: "MUSIC" },
  { href: "/blog", label: "BLOG" },
];

export default function SidebarNav() {
  return (
    <aside className="fixed left-0 top-0 flex h-screen w-28 flex-col px-6 py-12">
      <nav aria-label="Primary">
        <ul className="space-y-10">
          {items.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className="block">
                <div className="flex flex-col">
                  {label.split("").map((char, index) => (
                    <span
                      key={`${label}-${index}`}
                      className="text-sm uppercase tracking-wider text-neutral-400 transition-all hover:translate-x-1 hover:text-white"
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
