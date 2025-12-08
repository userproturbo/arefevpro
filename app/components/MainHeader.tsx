"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "My Projects" },
  { href: "/photo", label: "Photo" },
  { href: "/video", label: "Video" },
  { href: "/music", label: "Music" },
  { href: "/blog", label: "Blog" },
];

export default function MainHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[#04050a]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          CRAZYLIFE
        </Link>
        <nav aria-label="Primary">
          <ul className="flex flex-wrap items-center gap-4 text-sm uppercase tracking-[0.14em] sm:gap-6">
            {links.map(({ href, label }) => {
              const isActive = href === "/" ? pathname === "/" : pathname?.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`relative pb-1 text-white/80 transition hover:text-white after:absolute after:left-0 after:bottom-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-white/70 after:transition-transform after:duration-300 hover:after:scale-x-100 ${
                      isActive ? "text-white after:scale-x-100" : ""
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
