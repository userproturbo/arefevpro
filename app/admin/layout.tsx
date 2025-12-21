import type { ReactNode } from "react";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full min-h-screen flex-col bg-[#04050a] text-white">
      <header className="fixed left-16 right-0 top-0 z-30 border-b border-white/10 bg-[#04050a]">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-6">
          <Link href="/admin" className="text-sm text-white/70 hover:text-white">
            ← Dashboard
          </Link>
          <div className="text-base font-semibold">Admin</div>
          <div className="ml-auto">
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="box-border flex-1 overflow-y-auto pt-14">
        <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
      </div>
    </div>
  );
}
