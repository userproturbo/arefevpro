"use client";

import SidebarNav from "@/app/components/SidebarNav";
import SectionPanel from "@/app/components/SectionPanel";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SidebarNav />
      <SectionPanel />
      {children}
    </>
  );
}
