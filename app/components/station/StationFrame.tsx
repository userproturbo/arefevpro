import type { ReactNode } from "react";

type StationFrameProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
};

export default function StationFrame({
  children,
  className,
  innerClassName,
}: StationFrameProps) {
  return (
    <section
      className={`relative overflow-hidden rounded-[20px] border border-[#264d37] bg-[#050907] p-4 shadow-[0_0_0_1px_rgba(115,255,140,0.16),0_0_22px_rgba(115,255,140,0.2),0_20px_36px_rgba(0,0,0,0.5)] md:p-5 ${
        className ?? ""
      }`}
    >
      <div
        className={`relative rounded-[14px] border border-[#1c3e2b] bg-[#020504] p-3 shadow-[inset_0_0_0_1px_rgba(115,255,140,0.08)] md:p-4 ${
          innerClassName ?? ""
        }`}
      >
        {children}
      </div>
    </section>
  );
}
