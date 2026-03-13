import Link from "next/link";
import type { ReactNode } from "react";
import { AdminFrame, AdminSystemBar } from "@/app/admin/components/foundation";
import type { AdminSectionKey } from "./adminSections";
import { ADMIN_STATION_SECTIONS } from "./adminSections";
import AdminPresenceHeartbeat from "./AdminPresenceHeartbeat";

type Props = {
  activeSection: AdminSectionKey;
  children: ReactNode;
};

export default function AdminStationShell({ activeSection, children }: Props) {
  const current = ADMIN_STATION_SECTIONS.find((item) => item.key === activeSection);

  return (
    <div>
      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-4 md:py-6">
        <AdminPresenceHeartbeat />
        <AdminFrame>
          <AdminSystemBar mode={activeSection.toUpperCase()} scope="/ADMIN" />

          <nav
            className="mb-3 mt-4 flex flex-wrap gap-1.5 rounded-2xl border border-[color:var(--admin-border)] bg-[color:var(--admin-panel-alt)] p-1.5"
            aria-label="Admin Station Mode Select"
          >
            {ADMIN_STATION_SECTIONS.map((item) => {
              const isActive = item.key === activeSection;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  prefetch
                  className={`rounded-xl border px-3 py-1.5 text-xs uppercase tracking-[0.16em] transition ${
                    isActive
                      ? "border-[color:var(--admin-border)] bg-[color:var(--admin-glow)]/10 text-[color:var(--admin-text)] shadow-[0_0_10px_rgba(0,255,156,0.12)]"
                      : "border-[color:var(--admin-border)]/60 bg-transparent text-[color:var(--admin-text-muted)] hover:bg-[color:var(--admin-glow)]/10 hover:text-[color:var(--admin-text)]"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <section className="mb-3 rounded-2xl border border-[color:var(--admin-border)] bg-[color:var(--admin-panel)]/85 p-4">
            <div className="mb-3 border-b border-[color:var(--admin-border)] pb-3">
              <h1 className="text-lg font-semibold tracking-wide text-[color:var(--admin-text)]">
                {current?.label ?? "Admin"} Control
              </h1>
              <p className="text-sm text-[color:var(--admin-text-muted)]">
                {current?.description ?? "Manage section content."}
              </p>
            </div>

            <div>
              {children}
            </div>
          </section>
        </AdminFrame>
      </div>
    </div>
  );
}
