import Link from "next/link";
import type { ReactNode } from "react";
import StationFrame from "@/app/components/station/StationFrame";
import type { AdminSectionKey } from "./adminSections";
import { ADMIN_STATION_SECTIONS } from "./adminSections";

type Props = {
  activeSection: AdminSectionKey;
  children: ReactNode;
};

export default function AdminStationShell({ activeSection, children }: Props) {
  const current = ADMIN_STATION_SECTIONS.find((item) => item.key === activeSection);

  return (
    <div className="h-full min-h-0 bg-[#020805] text-[#d1f7dc]">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col px-4 py-4 md:py-6">
        <StationFrame
          className="flex h-full min-h-0 flex-col border-[#264d37]"
          innerClassName="flex h-full min-h-0 flex-col"
        >
          <header className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#1d442b] bg-[#07100b] px-3 py-2 text-[11px] uppercase tracking-[0.15em]">
            <span className="text-[#86b794]">Admin Station / Online</span>
            <div className="flex items-center gap-2">
              <span className="rounded border border-[#2f5f42] bg-[#0a1510] px-2 py-0.5 text-[#b8f8c8]">
                Mode: {activeSection}
              </span>
              <span className="h-3 w-px bg-[#29523a]" aria-hidden="true" />
              <span className="text-[#729d80]">Scope: /admin</span>
            </div>
          </header>

          <nav
            className="mb-3 flex flex-wrap gap-1.5 rounded-lg border border-[#1d442b] bg-[#060e0a] p-1.5"
            aria-label="Admin Station Mode Select"
          >
            {ADMIN_STATION_SECTIONS.map((item) => {
              const isActive = item.key === activeSection;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  prefetch
                  className={`rounded-md border px-3 py-1.5 text-xs uppercase tracking-[0.16em] transition ${
                    isActive
                      ? "border-[#3a7352] bg-[#0e1b14] text-[#c4fcd2] shadow-[0_0_0_1px_rgba(115,255,140,0.16),0_0_10px_rgba(115,255,140,0.18)]"
                      : "border-[#274a35] bg-[#08120d] text-[#86b896] hover:text-[#b4fdc3]"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <section className="mb-3 rounded-lg border border-[#1a4028] bg-[#050b07] p-3">
            <div className="mb-3 border-b border-[#1a4028] pb-2">
              <h1 className="text-lg font-semibold tracking-wide text-[#9ef6b2]">
                {current?.label ?? "Admin"} Control
              </h1>
              <p className="text-sm text-[#8bc99b]">
                {current?.description ?? "Manage section content."}
              </p>
            </div>

            <div className="min-h-0 overflow-auto [scrollbar-gutter:stable]">{children}</div>
          </section>
        </StationFrame>
      </div>
    </div>
  );
}
