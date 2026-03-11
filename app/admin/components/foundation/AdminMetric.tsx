type AdminMetricProps = {
  label: string;
  value: string | number;
  detail?: string;
};

export default function AdminMetric({ label, value, detail }: AdminMetricProps) {
  return (
    <div className="rounded-2xl border border-[color:var(--admin-border)] bg-[color:var(--admin-panel-alt)] px-4 py-4">
      <div className="text-[28px] font-semibold tracking-[-0.04em] text-[color:var(--admin-text)] sm:text-[34px]">
        {value}
      </div>
      <div className="mt-2 text-[11px] uppercase tracking-[0.22em] text-[color:var(--admin-text-muted)]">
        {label}
      </div>
      {detail ? <div className="mt-3 text-xs text-[color:var(--admin-text-muted)]">{detail}</div> : null}
    </div>
  );
}
