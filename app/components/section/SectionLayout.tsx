"use client";

import type { ReactNode } from "react";

export type SectionLayoutProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function SectionLayout({
  title,
  description,
  children,
}: SectionLayoutProps) {
  return (
    <section>
      <h1 className="text-3xl font-bold">{title}</h1>
      {description ? <p className="mt-2 text-white/60">{description}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}
