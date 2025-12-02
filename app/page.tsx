const sections = [
  { title: "Обо мне", href: "/about" },
  { title: "Фото", href: "/photos" },
  { title: "Видео", href: "/videos" },
  { title: "Музыка", href: "/music" },
  { title: "Блог", href: "/blog" },
];

export default function HomePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">CRAZYLIFE</h1>
      <p className="text-white/70 mb-8">
        Простой прототип: выбери раздел, чтобы посмотреть контент.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <a
            key={section.href}
            href={section.href}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-4 hover:border-white/40 transition"
          >
            <div className="text-lg font-semibold">{section.title}</div>
            <div className="text-sm text-white/60 mt-1">Открыть раздел</div>
          </a>
        ))}
      </div>
    </main>
  );
}
