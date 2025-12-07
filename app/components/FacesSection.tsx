"use client";

const cards = [
    { title: "ОБО МНЕ", accent: "from-sky-400/25 via-white/10 to-sky-900/25" },
    { title: "ФОТО", accent: "from-amber-400/25 via-white/10 to-orange-900/25" },
    { title: "ВИДЕО", accent: "from-indigo-400/25 via-white/10 to-indigo-900/25" },
    { title: "МУЗЫКА", accent: "from-emerald-400/25 via-white/10 to-emerald-900/25" },
    { title: "СТАТЬИ", accent: "from-pink-400/25 via-white/10 to-pink-900/25" },
];

export default function FacesSection() {
    return (
        <section
            id="faces"
            className="w-full bg-gradient-to-b from-[#06070f] via-[#0b0d14] to-[#06070f]"
        >
            <div className="max-w-[1400px] mx-auto px-6 pt-12 pb-20">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    {cards.map((card) => (
                        <div
                            key={card.title}
                            className="group flex-1 min-w-[180px] flex flex-col items-center"
                        >
                            <div className="relative w-full h-[480px] overflow-hidden rounded-3xl border border-white/10 bg-[#0b0d14] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-white/25 group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
                                <div className={`absolute inset-0 bg-gradient-to-b ${card.accent}`} />
                                <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.14),transparent_38%),radial-gradient(circle_at_80%_0,rgba(236,72,153,0.14),transparent_34%),radial-gradient(circle_at_50%_95%,rgba(56,189,248,0.14),transparent_34%)] transition duration-500 group-hover:opacity-80" />
                                <div className="relative flex h-full items-end p-5">
                                    <span className="text-lg font-semibold uppercase tracking-[0.16em] text-white/80">
                                        {card.title}
                                    </span>
                                </div>
                            </div>
                            <h6 className="uppercase text-xs tracking-wide mt-2 opacity-60 transition-colors duration-200 group-hover:opacity-90 text-[#bbb]">
                                {card.title}
                            </h6>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
