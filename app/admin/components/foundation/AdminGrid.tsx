import type { ReactNode } from "react";

type AdminGridProps = {
  children: ReactNode;
  className?: string;
};

export default function AdminGrid({ children, className }: AdminGridProps) {
  return (
    <div className={["grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}
