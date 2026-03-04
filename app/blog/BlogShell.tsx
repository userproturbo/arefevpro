"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

type BlogShellProps = {
  children: ReactNode;
};

export default function BlogShell({ children }: BlogShellProps) {
  const pathname = usePathname();
  const isBlogIndex = pathname === "/blog";

  return (
    <main className={isBlogIndex ? "" : "p-10"}>
      <div key={pathname} className="animate-content-in">
        {children}
      </div>
    </main>
  );
}
