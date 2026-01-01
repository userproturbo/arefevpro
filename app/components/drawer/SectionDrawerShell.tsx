"use client";

import type { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
};

export default function SectionDrawerShell({
  title,
  children,
}: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="px-5 pt-5">
        <p className="text-xs uppercase tracking-widest text-white/40">Section</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
      </header>

      <div className="px-5 pt-4">
        <div className="h-px bg-white/10" />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {children}
      </div>
    </div>
  );
}
