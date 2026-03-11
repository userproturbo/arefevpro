"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type AdminNavItem = {
  key: string;
  label: string;
  href: string;
  description?: string;
};

type AdminSidebarProps = {
  items: AdminNavItem[];
};

export default function AdminSidebar({ items }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="rounded-2xl border border-[color:var(--admin-border)] bg-[linear-gradient(180deg,rgba(7,26,18,0.9),rgba(4,17,12,0.94))] p-3">
      <div className="mb-2 px-2 py-2 text-[11px] uppercase tracking-[0.26em] text-[color:var(--admin-text-muted)]">
        Sections
      </div>
      <nav className="space-y-1" aria-label="Admin sections">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`block rounded-xl border px-3 py-3 transition ${
                isActive
                  ? "border-[color:var(--admin-border)] bg-[color:var(--admin-panel-alt)] text-[color:var(--admin-text)] shadow-[0_0_12px_rgba(0,255,156,0.08)]"
                  : "border-transparent text-[color:var(--admin-text-muted)] hover:border-[color:var(--admin-border)] hover:bg-[color:var(--admin-panel-alt)]/70 hover:text-[color:var(--admin-text)]"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="text-sm font-medium uppercase tracking-[0.08em]">{item.label}</div>
              {item.description ? (
                <p className="mt-1 text-xs text-[color:var(--admin-text-muted)]">{item.description}</p>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
