type AdminStatusBadgeProps = {
  status: "published" | "draft";
};

export default function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
  const isPublished = status === "published";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.08em] ${
        isPublished
          ? "border-emerald-300/45 bg-emerald-400/14 text-emerald-200"
          : "border-white/20 bg-white/10 text-white/70"
      }`}
    >
      {isPublished ? "Published" : "Draft"}
    </span>
  );
}
