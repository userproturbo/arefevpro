"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  type SectionDrawerSection,
  useSectionDrawerStore,
} from "@/store/useSectionDrawerStore";
import { useAuth } from "../providers";

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
  const router = useRouter();
  const { user, loading: authLoading, refresh } = useAuth();
  const toggleDrawer = useSectionDrawerStore((s) => s.toggle);
  const closeDrawer = useSectionDrawerStore((s) => s.close);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = async () => {
    if (logoutLoading) return;
    setLogoutLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      await refresh();
      closeDrawer();
      router.push("/");
      router.refresh();
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <aside
      className="h-full shrink-0 border-r border-white/10 flex flex-col"
      style={{ width: MENU_WIDTH }}
    >
      <nav className="flex-1 flex items-center justify-center">
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

      {!authLoading && (
        <div className="pb-6 flex justify-center">
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutLoading}
              className="text-[0.7rem] uppercase tracking-[0.14em] text-white/80 hover:text-white disabled:opacity-60"
            >
              {logoutLoading ? "..." : "Выйти"}
            </button>
          ) : (
            <div className="flex flex-col items-center gap-2 text-[0.7rem] uppercase tracking-[0.14em] text-white/70">
              <Link
                href="/login"
                className="hover:text-white"
                onClick={() => closeDrawer()}
              >
                Войти
              </Link>
              <Link
                href="/register"
                className="hover:text-white"
                onClick={() => closeDrawer()}
              >
                Регистрация
              </Link>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
