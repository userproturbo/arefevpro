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

const isPanelType = (type: NavItem["type"]): type is Exclude<PanelType, null> =>
  type !== "home";

export default function SidebarNav() {
  const { openPanel, closePanel, setActiveSection } = usePanel();

  return (
    <aside className="fixed left-0 top-0 z-60 flex h-screen w-20 flex-col overflow-y-auto border-r border-white/10">
      <nav aria-label="Primary" className="flex h-full w-full">
        <ul className="flex h-full w-full flex-col items-center justify-center gap-5 px-3 py-8 sm:gap-6 sm:py-10 md:gap-7 md:py-12 lg:gap-8">

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
              <li key={item.label} className="flex w-full justify-center">
                {item.type === "home" ? (
                  <Link
                    href="/"
                    className="flex w-full justify-center"
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
                    className="flex w-full justify-center"
                    onClick={() => {
                      if (isPanelType(item.type)) {
                        openPanel(item.type);
                      }
                    }}
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
