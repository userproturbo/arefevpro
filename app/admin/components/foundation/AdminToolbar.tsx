import type { ReactNode } from "react";

type AdminToolbarProps = {
  children: ReactNode;
};

export default function AdminToolbar({ children }: AdminToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
      {children}
    </div>
  );
}
