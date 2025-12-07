import Link from "next/link";

const sections = [
  { title: "Обо мне", label: "ОБО МНЕ", href: "/about", accent: "from-sky-400/25 via-white/5 to-sky-900/30" },
  { title: "Фото", label: "ФОТО", href: "/photos", accent: "from-amber-400/25 via-white/5 to-orange-900/30" },
  { title: "Видео", label: "ВИДЕО", href: "/videos", accent: "from-indigo-400/25 via-white/5 to-indigo-900/30" },
  { title: "Музыка", label: "МУЗЫКА", href: "/music", accent: "from-emerald-400/25 via-white/5 to-emerald-900/30" },
  { title: "Блог", label: "БЛОГ", href: "/blog", accent: "from-pink-400/25 via-white/5 to-pink-900/30" },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-screen-2xl px-4 py-12">
      <div className="mb-10 flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">CRAZYLIFE</h1>
        <p className="max-w-2xl text-sm text-white/70 sm:text-base">
          Простой прототип: выбери раздел, чтобы посмотреть контент.
        </p>
      </div>
      <div className="mt-[60px] flex items-start justify-center gap-5">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group relative block overflow-hidden border-2 border-white/10 bg-[#111] shadow-[0_14px_36px_-20px_rgba(0,0,0,0.85)] transition duration-300 hover:-translate-y-1 hover:border-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
            aria-label={`Перейти в раздел ${section.title}`}
            style={{ width: 260 }}
          >
            <div className="relative aspect-[3/5] overflow-hidden bg-[#0b0d14]">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${section.accent} transition duration-500 group-hover:scale-105`}
              />
              <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.14),transparent_38%),radial-gradient(circle_at_80%_0,rgba(255,160,200,0.14),transparent_34%),radial-gradient(circle_at_50%_95%,rgba(56,189,248,0.16),transparent_34%)] transition duration-500 group-hover:opacity-80" />
              <div className="absolute inset-0 border border-white/10" />
              <div className="relative flex h-full flex-col justify-between p-4">
                <div className="text-xs uppercase tracking-[0.14em] text-white/50">Раздел</div>
                <div className="space-y-2">
                  <p className="text-2xl font-semibold leading-tight text-white">{section.title}</p>
                  <p className="text-sm font-mono uppercase tracking-[0.18em] text-white/70">
                    {section.label}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
