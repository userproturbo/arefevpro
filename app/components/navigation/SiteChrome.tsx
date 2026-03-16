"use client";

import { usePathname } from "next/navigation";
import TopIconNav from "./TopIconNav";

export default function SiteChrome() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const showNav = !pathname.startsWith("/admin") && !isHome;

  return showNav ? <TopIconNav /> : null;
}
