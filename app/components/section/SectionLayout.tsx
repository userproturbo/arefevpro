"use client";

import type { ReactNode } from "react";
import PageContainer from "../PageContainer";

interface SectionLayoutProps {
  title: string;
  description?: string;
  sidebar: ReactNode;
  children: ReactNode;
}

export default function SectionLayout({
  title,
  description,
  sidebar,
  children,
}: SectionLayoutProps) {
  return (
    <PageContainer>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:gap-8">
        <aside className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-6 sm:px-6 sm:py-8 shadow-inner shadow-black/30">
          {sidebar}
        </aside>

        <section className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-6 sm:px-7 sm:py-8 shadow-inner shadow-black/20">
          <header className="space-y-2 border-b border-white/10 pb-3">
            <h1 className="text-2xl font-semibold text-white">{title}</h1>
            {description ? (
              <p className="text-sm leading-relaxed text-white/60">{description}</p>
            ) : null}
          </header>

          <div className="mt-5">{children}</div>
        </section>
      </div>
    </PageContainer>
  );
}
