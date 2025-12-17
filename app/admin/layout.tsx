import type { ReactNode } from "react";
import LogoutButton from "./LogoutButton";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#04050a] text-white">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <header className="flex items-center justify-end">
          <LogoutButton />
        </header>
        {children}
      </div>
    </div>
  );
}
