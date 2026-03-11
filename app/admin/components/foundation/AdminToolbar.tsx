import type { ReactNode } from "react";

type AdminToolbarProps = {
  children: ReactNode;
};

export default function AdminToolbar({ children }: AdminToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[color:var(--admin-border)] bg-[color:var(--admin-panel-alt)]/65 p-3">
      {children}
    </div>
  );
}
