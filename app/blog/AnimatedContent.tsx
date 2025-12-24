"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function AnimatedContent({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="animate-content-in">
      {children}
    </div>
  );
}
