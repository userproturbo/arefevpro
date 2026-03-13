import type { ReactNode } from "react";
import AdminGlowContainer from "./AdminGlowContainer";

export default function AdminFrame({ children }: { children: ReactNode }) {
  return (
    <AdminGlowContainer className="relative bg-[color:var(--admin-bg)]/95 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,255,156,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,156,0.04)_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(0,255,156,0.18),transparent_70%)]" />
      <div className="relative rounded-[24px] border border-white/5 bg-[linear-gradient(180deg,rgba(4,17,12,0.94),rgba(2,8,6,0.98))] p-4 sm:p-5 lg:p-6">
        {children}
      </div>
    </AdminGlowContainer>
  );
}
