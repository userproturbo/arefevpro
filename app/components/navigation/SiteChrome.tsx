"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import TopIconNav from "./TopIconNav";

type SiteChromeProps = {
  children: ReactNode;
};

export default function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const showNav = !pathname.startsWith("/admin") && !isHome;

  return (
    <>
      {showNav ? <TopIconNav /> : null}
      <div className={showNav ? "min-h-screen bg-black pt-16" : "min-h-screen"}>
        {children}
      </div>
    </>
  );
}
