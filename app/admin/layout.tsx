import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-screen min-h-screen flex-col overflow-hidden bg-[#04060d] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_-10%,rgba(255,155,110,0.18),transparent_40%),radial-gradient(circle_at_100%_0%,rgba(139,199,255,0.14),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]" />
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  );
}
