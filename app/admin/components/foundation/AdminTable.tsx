import type { ReactNode } from "react";

type AdminTableProps = {
  children: ReactNode;
};

export default function AdminTable({ children }: AdminTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[color:var(--admin-border)] bg-[color:var(--admin-panel-alt)]/70">
      <table className="w-full min-w-[640px] border-collapse text-sm text-[color:var(--admin-text)]">{children}</table>
    </div>
  );
}
