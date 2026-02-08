"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHoverSound } from "../hooks/useHoverSound";

const links = [
  { href: "/", label: "HOME" },
  { href: "/projects", label: "PROJECTS" },
  { href: "/photo", label: "PHOTO" },
  { href: "/video", label: "VIDEO" },
  { href: "/music", label: "MUSIC" },
  { href: "/blog", label: "BLOG" },
];

export default function MainHeader() {
  const pathname = usePathname();
  const playHoverSound = useHoverSound({
    src: "/audio/preloader-2s-001.mp3",
    volume: 0.3,
  });

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[#04050a]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-center px-6 py-5">
        <nav aria-label="Primary">
          <ul className="flex flex-wrap items-center justify-center gap-4 text-sm uppercase tracking-[0.14em] sm:gap-6">
            {links.map(({ href, label }) => {
              const isActive = href === "/" ? pathname === "/" : pathname?.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onMouseEnter={(event) => {
                      if (!event.currentTarget.classList.contains("top-nav-link")) return;
                      playHoverSound();
                    }}
                    className={`top-nav-link relative pb-1 text-white/80 ${
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
