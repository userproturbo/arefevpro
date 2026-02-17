import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen min-h-screen flex-col overflow-hidden bg-[#04050a] text-white">
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
