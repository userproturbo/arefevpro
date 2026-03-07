"use client";

import type { ReactNode } from "react";

type CharacterWindowProps = {
  children: ReactNode;
};

export default function CharacterWindow({ children }: CharacterWindowProps) {
  return (
    <div className="relative h-[280px] w-full overflow-hidden rounded-2xl border-[3px] border-black bg-[radial-gradient(circle_at_50%_20%,rgba(170,40,40,0.26),rgba(12,12,12,0.96)_70%)] shadow-[0_20px_50px_rgba(0,0,0,0.5)] md:h-[460px]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.2))]" />
      <div className="relative z-10 flex h-full w-full items-center justify-center p-2">{children}</div>
    </div>
  );
}
