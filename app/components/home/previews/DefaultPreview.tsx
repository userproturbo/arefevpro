"use client";

const DEFAULT_CARDS = [
  { id: "photo", label: "PHOTO", tone: "from-amber-300/30 to-orange-500/20" },
  { id: "blog", label: "BLOG", tone: "from-blue-300/30 to-cyan-500/20" },
  { id: "drone", label: "DRONE", tone: "from-emerald-300/30 to-teal-500/20" },
  { id: "music", label: "MUSIC", tone: "from-rose-300/30 to-red-500/20" },
];

export default function DefaultPreview() {
  return (
    <div className="grid grid-cols-2 gap-[10px] sm:grid-cols-4">
      {DEFAULT_CARDS.map((card) => (
        <div
          key={card.id}
          className={`flex h-[82px] items-end rounded-xl border border-white/15 bg-gradient-to-br ${card.tone} p-3`}
        >
          <span className="text-xs font-semibold tracking-[0.12em] text-white/90">{card.label}</span>
        </div>
      ))}
    </div>
  );
}
