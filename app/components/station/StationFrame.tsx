import type { ReactNode } from "react";

type StationFrameProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  withInnerFrame?: boolean;
};

export default function StationFrame({
  children,
  className,
  innerClassName,
  withInnerFrame = true,
}: StationFrameProps) {
  const innerFrameClassName = withInnerFrame
    ? "relative border-0 bg-transparent p-0 rounded-none shadow-none sm:rounded-[14px] sm:border sm:border-[#1c3e2b] sm:bg-[#020504] sm:p-3 sm:shadow-[inset_0_0_0_1px_rgba(115,255,140,0.08)] md:p-4"
    : "relative border-0 bg-transparent p-0 rounded-none shadow-none";

  return (
    <section
      className={`relative overflow-hidden rounded-[20px] border border-[#264d37] bg-[#050907] p-4 shadow-[0_0_0_1px_rgba(115,255,140,0.16),0_0_22px_rgba(115,255,140,0.2),0_20px_36px_rgba(0,0,0,0.5)] md:p-5 ${
        className ?? ""
      }`}
    >
      <div className={`${innerFrameClassName} ${innerClassName ?? ""}`}>
        {children}
      </div>
    </section>
  );
}
