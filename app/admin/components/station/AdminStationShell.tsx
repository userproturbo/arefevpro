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
    <div className="h-full min-h-0 bg-[#090503] text-[#ffe9dc]">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col px-4 py-4 md:py-6">
        <StationFrame
          className="flex h-full min-h-0 flex-col border-[#5b3525] shadow-[0_0_0_1px_rgba(255,148,87,0.16),0_0_22px_rgba(255,148,87,0.16),0_20px_36px_rgba(0,0,0,0.56)]"
          innerClassName="flex h-full min-h-0 flex-col border-[#4a2b1f] bg-[#110905]"
        >
          <header className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#5a3524] bg-[#170d08] px-3 py-2 text-[11px] uppercase tracking-[0.15em]">
            <span className="text-[#ffc7a7]">Admin Station / Online</span>
            <div className="flex items-center gap-2">
              <span className="rounded border border-[#7a4a34] bg-[#26150e] px-2 py-0.5 text-[#ffd9c3]">
                Mode: {activeSection}
              </span>
              <span className="h-3 w-px bg-[#764833]" aria-hidden="true" />
              <span className="text-[#d59879]">Scope: /admin</span>
            </div>
          </header>

          <nav
            className="mb-3 flex flex-wrap gap-1.5 rounded-lg border border-[#5a3524] bg-[#130b07] p-1.5"
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
                      ? "border-[#b56c48] bg-[#2a1710] text-[#ffe8da] shadow-[0_0_0_1px_rgba(255,170,125,0.16),0_0_10px_rgba(255,170,125,0.14)]"
                      : "border-[#5a3524] bg-[#180e09] text-[#ce9f86] hover:text-[#ffd7c1]"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <section className="mb-3 rounded-lg border border-[#5a3524] bg-[#130a07] p-3">
            <div className="mb-3 border-b border-[#5a3524] pb-2">
              <h1 className="text-lg font-semibold tracking-wide text-[#ffd6bf]">
                {current?.label ?? "Admin"} Control
              </h1>
              <p className="text-sm text-[#d19b80]">
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
