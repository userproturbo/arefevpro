import type { ReactNode } from "react";

type AdminGlowContainerProps = {
  children: ReactNode;
  className?: string;
};

export default function AdminGlowContainer({ children, className }: AdminGlowContainerProps) {
  return (
    <div
      className={[
        "rounded-[28px] border border-[color:var(--admin-border)]",
        "bg-[radial-gradient(circle_at_top,rgba(0,255,156,0.08),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))]",
        "shadow-[0_0_0_1px_rgba(0,255,156,0.08),0_0_32px_rgba(0,255,156,0.08)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
