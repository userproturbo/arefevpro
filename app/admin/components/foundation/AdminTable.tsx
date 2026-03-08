import type { ReactNode } from "react";

type AdminTableProps = {
  children: ReactNode;
};

export default function AdminTable({ children }: AdminTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
      <table className="w-full min-w-[640px] border-collapse text-sm">{children}</table>
    </div>
  );
}
