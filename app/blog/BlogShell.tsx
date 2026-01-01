"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

type BlogShellProps = {
  children: ReactNode;
};

export default function BlogShell({ children }: BlogShellProps) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen p-10 overflow-hidden">
      <div key={pathname} className="animate-content-in">
        {children}
      </div>
    </main>
  );
}
