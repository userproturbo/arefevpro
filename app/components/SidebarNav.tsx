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
        <ul>
          {items.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className="group block">
                <div className="mb-10 flex flex-col cursor-pointer transition-all duration-300 group-hover:translate-x-1">
                  {label.split("").map((char, index) => (
                    <span
                      key={`${label}-${index}`}
                      className="text-sm uppercase tracking-wider text-neutral-500 transition-colors group-hover:text-white"
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
