"use client";

import { usePathname } from "next/navigation";
import SectionDrawer from "./SectionDrawer";

export default function SectionDrawerMount() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return <SectionDrawer />;
}

