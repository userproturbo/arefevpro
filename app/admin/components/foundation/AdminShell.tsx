import type { ReactNode } from "react";
import AdminSidebar, { type AdminNavItem } from "./AdminSidebar";

type AdminShellProps = {
  navItems: AdminNavItem[];
  children: ReactNode;
};

export default function AdminShell({ navItems, children }: AdminShellProps) {
  return (
    <main className="relative h-full min-h-0 w-full overflow-y-auto bg-[#05070d] px-4 py-4 sm:px-6 sm:py-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_5%_0%,rgba(255,155,110,0.14),transparent_42%),radial-gradient(circle_at_100%_0%,rgba(139,199,255,0.12),transparent_36%)]" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AdminSidebar items={navItems} />
        <div className="rounded-2xl border border-white/10 bg-[#0b0f16]/90 p-5 shadow-[0_28px_48px_rgba(0,0,0,0.32)] sm:p-6">
          {children}
        </div>
      </div>
    </main>
  );
}
