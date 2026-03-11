type AdminStatusBadgeProps = {
  status: "published" | "draft";
};

export default function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
  const isPublished = status === "published";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] ${
        isPublished
          ? "border-[color:var(--admin-border)] bg-[color:var(--admin-glow)]/10 text-[color:var(--admin-text)]"
          : "border-white/10 bg-white/5 text-[color:var(--admin-text-muted)]"
      }`}
    >
      {isPublished ? "Published" : "Draft"}
    </span>
  );
}
