import type { ReactNode } from "react";

type AdminEmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function AdminEmptyState({ title, description, action }: AdminEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-white/20 bg-white/[0.02] px-6 py-8 text-center">
      <p className="text-sm font-medium text-white">{title}</p>
      {description ? <p className="mt-2 text-sm text-white/55">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
