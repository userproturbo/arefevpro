import type { ReactNode } from "react";

type AdminCardProps = {
  children: ReactNode;
  className?: string;
};

export default function AdminCard({ children, className }: AdminCardProps) {
  return (
    <section
      className={`rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 shadow-[0_24px_40px_rgba(0,0,0,0.25)] ${className ?? ""}`}
    >
      {children}
    </section>
  );
}
