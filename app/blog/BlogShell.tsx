"use client";

import { ReactNode, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import BlogSidebar from "./BlogSidebar";

type BlogShellProps = {
  posts: { id: number; title: string | null; slug: string }[];
  children: ReactNode;
};

function restartAnimation(el: HTMLElement, className: string) {
  el.classList.remove(className);
  // force reflow
  void el.offsetWidth;
  el.classList.add(className);
}

export default function BlogShell({ posts, children }: BlogShellProps) {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Храним прошлый pathname глобально, чтобы понимать "вход в блог" из другого раздела
    const w = window as unknown as { __prevPathname?: string };
    const prev = w.__prevPathname;
    w.__prevPathname = pathname;

    const isNowBlog = pathname.startsWith("/blog");
    const wasBlog = (prev ?? "").startsWith("/blog");

    // Анимация ТОЛЬКО когда мы "вошли в блог" (из /video -> /blog, / -> /blog и т.д.)
    if (isNowBlog && !wasBlog && sidebarRef.current) {
      restartAnimation(sidebarRef.current, "animate-sidebar-slide-in");
    }
  }, [pathname]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar (высота на весь экран) */}
      <aside
        ref={(node) => {
          sidebarRef.current = node;
        }}
        className="w-72 shrink-0 border-r border-white/10 bg-black/40"
      >
        <div className="h-screen p-4">
          <BlogSidebar posts={posts} />
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-10 overflow-hidden">
        {/* Контент можно анимировать на каждый переход slug */}
        <div key={pathname} className="animate-content-in">
          {children}
        </div>
      </main>
    </div>
  );
}
