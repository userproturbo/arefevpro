type AdminSystemBarProps = {
  mode: string;
  scope?: string;
  link?: string;
  signal?: string;
  title?: string;
};

export default function AdminSystemBar({
  mode,
  scope = "ADMIN",
  link = "STABLE",
  signal = "100%",
  title = "ADMIN STATION",
}: AdminSystemBarProps) {
  return (
    <div className="rounded-2xl border border-[color:var(--admin-border)] bg-[color:var(--admin-panel-alt)] px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-[0.22em] text-[color:var(--admin-text)]">
        <span>{title}</span>
        <span className="inline-flex items-center gap-2 text-[color:var(--admin-text-muted)]">
          <span className="h-2 w-2 rounded-full bg-[color:var(--admin-glow)] shadow-[0_0_8px_var(--admin-glow)]" />
          Online
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] uppercase tracking-[0.18em] text-[color:var(--admin-text-muted)]">
        <span>Mode: {mode}</span>
        <span>Scope: {scope}</span>
        <span>Link: {link}</span>
        <span>Signal: {signal}</span>
      </div>
    </div>
  );
}
