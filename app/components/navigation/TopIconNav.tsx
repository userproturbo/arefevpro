"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  iconSrc: string;
  activeMatch?: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/",
    iconSrc: "/icons/home.svg",
  },
  {
    label: "Blog",
    href: "/blog",
    iconSrc: "/icons/blog.svg",
  },
  {
    label: "Photo",
    href: "/photo",
    iconSrc: "/icons/photo.svg",
    activeMatch: (pathname) =>
      pathname === "/photo" ||
      pathname.startsWith("/photo/") ||
      pathname === "/photos" ||
      pathname.startsWith("/photos/"),
  },
  {
    label: "Video",
    href: "/video",
    iconSrc: "/icons/video.svg",
    activeMatch: (pathname) =>
      pathname === "/video" ||
      pathname.startsWith("/video/") ||
      pathname === "/videos" ||
      pathname.startsWith("/videos/"),
  },
  {
    label: "Audio",
    href: "/music",
    iconSrc: "/icons/audio.svg",
    activeMatch: (pathname) => pathname === "/music" || pathname.startsWith("/music/"),
  },
];

export default function TopIconNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed top-0 left-0 z-50 flex h-16 w-full items-center justify-center bg-black"
    >
      <ul className="flex items-center justify-center gap-5 sm:gap-7">
        {NAV_ITEMS.map((item) => {
          const isActive = item.activeMatch ? item.activeMatch(pathname) : pathname === item.href;

          return (
            <li key={item.label}>
              <Link
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className="group relative flex h-11 w-11 items-center justify-center opacity-70 transition duration-200 hover:scale-105 hover:opacity-100 focus:outline-none focus-visible:opacity-100"
              >
                <Image
                  src={item.iconSrc}
                  alt=""
                  width={24}
                  height={24}
                  aria-hidden="true"
                  className="h-6 w-6 select-none object-contain invert"
                />
                <span className="sr-only">{item.label}</span>
                <span
                  aria-hidden="true"
                  className={`absolute bottom-1 left-1/2 h-px w-5 -translate-x-1/2 bg-white transition-opacity duration-200 ${
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60"
                  }`}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
