import type { ReactNode } from "react";

type AdminPanelProps = {
  title?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  aside?: ReactNode;
};

export default function AdminPanel({
  title,
  children,
  className,
  contentClassName,
  aside,
}: AdminPanelProps) {
  return (
    <section
      className={[
        "rounded-[22px] border border-[color:var(--admin-border)] bg-[linear-gradient(180deg,rgba(7,26,18,0.92),rgba(4,17,12,0.95))]",
        "shadow-[0_0_0_1px_rgba(0,255,156,0.04),0_0_22px_rgba(0,255,156,0.05)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {title || aside ? (
        <div className="flex items-center justify-between gap-3 border-b border-[color:var(--admin-border)] px-4 py-3">
          {title ? (
            <div className="text-xs font-medium uppercase tracking-[0.28em] text-[color:var(--admin-text)]">
              {title}
            </div>
          ) : (
            <div />
          )}
          {aside}
        </div>
      ) : null}
      <div className={["p-4 sm:p-5", contentClassName].filter(Boolean).join(" ")}>{children}</div>
    </section>
  );
}
