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
    <aside className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="mb-2 px-2 py-2 text-[11px] uppercase tracking-[0.26em] text-white/45">Sections</div>
      <nav className="space-y-1" aria-label="Admin sections">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`block rounded-xl border px-3 py-3 transition ${
                isActive
                  ? "border-white/25 bg-white/10 text-white"
                  : "border-transparent text-white/70 hover:border-white/12 hover:bg-white/[0.06] hover:text-white"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="text-sm font-medium uppercase tracking-[0.08em]">{item.label}</div>
              {item.description ? <p className="mt-1 text-xs text-white/50">{item.description}</p> : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
