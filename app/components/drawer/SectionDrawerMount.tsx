"use client";

import { usePathname } from "next/navigation";
import SectionDrawer from "./SectionDrawer";

export default function SectionDrawerMount() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return null;
  }

  return <SectionDrawer />;
}
