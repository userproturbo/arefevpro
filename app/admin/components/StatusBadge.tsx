type StatusBadgeProps = {
    published: boolean;
  };
  
  export default function StatusBadge({ published }: StatusBadgeProps) {
    return (
      <span
        className={
          published
            ? "rounded bg-emerald-500/20 px-2 py-1 text-xs text-emerald-400"
            : "rounded bg-white/10 px-2 py-1 text-xs text-white/60"
        }
      >
        {published ? "Published" : "Draft"}
      </span>
    );
  }
  