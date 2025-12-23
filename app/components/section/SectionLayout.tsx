"use client";

import type { ReactNode } from "react";
import PageContainer from "../PageContainer";

export type SectionLayoutProps = {
  title: string;
  description?: string;
  sidebar?: ReactNode; // ✅ optional
  children: ReactNode;
};

export default function SectionLayout({
  title,
  description,
  sidebar,
  children,
}: SectionLayoutProps) {
  return (
    <section className="flex gap-8">
      {sidebar ? (
        <aside className="w-64 shrink-0">
          {sidebar}
        </aside>
      ) : null}

      <div className="flex-1">
        <h1 className="text-3xl font-bold">{title}</h1>
        {description ? (
          <p className="mt-2 text-white/60">{description}</p>
        ) : null}

        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

