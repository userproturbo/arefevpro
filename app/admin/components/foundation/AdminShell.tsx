import type { ReactNode } from "react";
import AdminSidebar, { type AdminNavItem } from "./AdminSidebar";

type AdminShellProps = {
  navItems: AdminNavItem[];
  children: ReactNode;
};

export default function AdminShell({ navItems, children }: AdminShellProps) {
  return (
    <main className="relative h-full min-h-0 w-full overflow-y-auto bg-transparent px-4 py-4 sm:px-6 sm:py-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_5%_0%,rgba(0,255,156,0.12),transparent_32%),radial-gradient(circle_at_100%_0%,rgba(0,255,156,0.06),transparent_28%)]" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AdminSidebar items={navItems} />
        <div className="rounded-2xl border border-[color:var(--admin-border)] bg-[linear-gradient(180deg,rgba(7,26,18,0.92),rgba(4,17,12,0.96))] p-5 shadow-[0_0_0_1px_rgba(0,255,156,0.04),0_0_28px_rgba(0,255,156,0.05)] sm:p-6">
          {children}
        </div>
      </div>
    </main>
  );
}
