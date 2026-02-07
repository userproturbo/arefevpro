import type { ReactNode } from "react";

type StationFrameProps = {
  children: ReactNode;
};

export default function StationFrame({ children }: StationFrameProps) {
  return (
    <section className="relative overflow-hidden rounded-[20px] border border-[#264d37] bg-[#050907] p-4 shadow-[0_0_0_1px_rgba(115,255,140,0.16),0_0_22px_rgba(115,255,140,0.2),0_20px_36px_rgba(0,0,0,0.5)] md:p-5">
      <div className="pointer-events-none absolute left-5 top-0 -translate-y-1/2 rounded border border-[#2b5f42] bg-[#050b08] px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-[#89c99d]">
        Research Interface
      </div>

      <div className="pointer-events-none absolute right-0 top-0 h-5 w-8 rounded-bl-md border-b border-l border-[#2b5f42] bg-[#050907]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-4 w-10 rounded-tr-md border-r border-t border-[#2b5f42] bg-[#050907]" />

      <div className="pointer-events-none absolute left-3 top-3 h-3 w-px bg-[#5b9c72]" />
      <div className="pointer-events-none absolute left-3 top-3 h-px w-3 bg-[#5b9c72]" />
      <div className="pointer-events-none absolute right-3 top-3 h-3 w-px bg-[#5b9c72]" />
      <div className="pointer-events-none absolute right-3 top-3 h-px w-3 -translate-x-3 bg-[#5b9c72]" />
      <div className="pointer-events-none absolute bottom-3 left-3 h-3 w-px bg-[#5b9c72]" />
      <div className="pointer-events-none absolute bottom-3 left-3 h-px w-3 -translate-y-3 bg-[#5b9c72]" />
      <div className="pointer-events-none absolute bottom-3 right-3 h-3 w-px bg-[#5b9c72]" />
      <div className="pointer-events-none absolute bottom-3 right-3 h-px w-3 -translate-x-3 -translate-y-3 bg-[#5b9c72]" />

      <div className="pointer-events-none absolute left-20 top-0 h-px w-16 bg-[#437555]" />
      <div className="pointer-events-none absolute right-14 bottom-0 h-px w-12 bg-[#437555]" />

      <div className="relative rounded-[14px] border border-[#1c3e2b] bg-[#020504] p-3 shadow-[inset_0_0_0_1px_rgba(115,255,140,0.08)] md:p-4">
        {children}
      </div>
    </section>
  );
}
