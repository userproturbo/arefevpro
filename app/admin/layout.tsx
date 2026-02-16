import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-full min-h-screen bg-[#04050a] text-white">
      {children}
    </div>
  );
}
