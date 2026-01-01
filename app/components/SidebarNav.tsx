"use client";

import Link from "next/link";
import {
  type SectionDrawerSection,
  useSectionDrawerStore,
} from "@/store/useSectionDrawerStore";

const MENU_WIDTH = 72;

type NavItem = { label: string; href: string; drawerSection?: SectionDrawerSection };

const navItems: NavItem[] = [
  { label: "HOME", href: "/" },
  { label: "PROJECTS", href: "/projects", drawerSection: "projects" },
  { label: "PHOTO", href: "/photo", drawerSection: "photo" },
  { label: "VIDEO", href: "/video", drawerSection: "video" },
  { label: "MUSIC", href: "/music", drawerSection: "music" },
  { label: "BLOG", href: "/blog", drawerSection: "blog" },
];

export default function SidebarNav() {
  const toggleDrawer = useSectionDrawerStore((s) => s.toggle);
  const closeDrawer = useSectionDrawerStore((s) => s.close);

  return (
    <aside
      className="h-full shrink-0 border-r border-white/10"
      style={{ width: MENU_WIDTH }}
    >
      <nav className="h-full flex items-center justify-center">
        <ul className="flex flex-col gap-6 items-center">
          {navItems.map((item) => {
            const content = (
              <div className="menu-word">
                {item.label.split("").map((char, index) => (
                  <span
                    key={`${item.label}-${index}`}
                    style={{ transitionDelay: `${(item.label.length - index) * 60}ms` }}
                    className="menu-letter text-[0.7rem] sm:text-xs md:text-sm lg:text-base"
                  >
                    {char}
                  </span>
                ))}
              </div>
            );

            return (
              <li key={item.label} className="flex w-full">
                <Link
                  href={item.href}
                  className="flex w-full"
                  onClick={() => {
                    if (item.drawerSection) {
                      toggleDrawer(item.drawerSection);
                    } else {
                      closeDrawer();
                    }
                  }}
                >
                  {content}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
