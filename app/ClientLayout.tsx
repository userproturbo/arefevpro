"use client";

import SectionPanel from "@/app/components/SectionPanel";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SectionPanel />
      {children}
    </>
  );
}
