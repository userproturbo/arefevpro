"use client";

import { ReactNode, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function BlogTemplate({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 💡 перезапуск анимации КАЖДЫЙ раз при входе в /blog
    el.classList.remove("animate-sidebar-slide-in");
    void el.offsetWidth; // force reflow
    el.classList.add("animate-sidebar-slide-in");
  }, [pathname]); // 🔑 срабатывает при возврате из /video

  return (
    <div ref={ref} className="animate-sidebar-slide-in">
      {children}
    </div>
  );
}
