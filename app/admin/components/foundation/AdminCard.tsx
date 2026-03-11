import type { ReactNode } from "react";

type AdminCardProps = {
  children: ReactNode;
  className?: string;
};

export default function AdminCard({ children, className }: AdminCardProps) {
  return (
    <section
      className={`rounded-2xl border border-[color:var(--admin-border)] bg-[linear-gradient(180deg,rgba(7,26,18,0.92),rgba(4,17,12,0.96))] p-5 shadow-[0_0_0_1px_rgba(0,255,156,0.04),0_0_18px_rgba(0,255,156,0.05)] ${className ?? ""}`}
    >
      {children}
    </section>
  );
}
