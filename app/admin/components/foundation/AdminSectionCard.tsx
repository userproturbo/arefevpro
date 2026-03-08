import Link from "next/link";

export type AdminSectionCardProps = {
  title: string;
  description: string;
  href: string;
  metricLabel?: string;
  metricValue?: string | number;
};

export default function AdminSectionCard({
  title,
  description,
  href,
  metricLabel,
  metricValue,
}: AdminSectionCardProps) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-white/20 hover:bg-white/[0.06]"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-base font-medium uppercase tracking-[0.08em] text-white">{title}</h2>
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#ff9b6e]/80">Open</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-white/58">{description}</p>
      {metricLabel ? (
        <div className="mt-4 border-t border-white/10 pt-3 text-xs text-white/55">
          <span className="uppercase tracking-[0.14em]">{metricLabel}: </span>
          <span className="font-medium text-white/80">{metricValue ?? "-"}</span>
        </div>
      ) : null}
    </Link>
  );
}
