import Image from "next/image";
import Link from "next/link";

const sections = [
  { title: "Обо мне", label: "ОБО МНЕ", href: "/about", image: "/img/face1.gif" },
  { title: "Фото", label: "ФОТО", href: "/photos", image: "/img/face2.gif" },
  { title: "Видео", label: "ВИДЕО", href: "/videos", image: "/img/face3.gif" },
  { title: "Музыка", label: "МУЗЫКА", href: "/music", image: "/img/face4.gif" },
  { title: "Блог", label: "БЛОГ", href: "/blog", image: "/img/face5.gif" },
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
        {sections.map((section, index) => (
          <Link
            key={section.href}
            href={section.href}
            className="group relative block overflow-hidden border-2 border-white/10 bg-[#111] shadow-[0_14px_36px_-20px_rgba(0,0,0,0.85)] transition duration-300 hover:-translate-y-1 hover:border-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
            aria-label={`Перейти в раздел ${section.title}`}
            style={{ width: 260 }}
          >
            <div className="relative aspect-[3/5] overflow-hidden bg-black">
              <Image
                src={section.image}
                alt={section.title}
                fill
                priority={index === 0}
                sizes="(min-width: 1280px) 260px, (min-width: 1024px) 240px, (min-width: 768px) 220px, 50vw"
                className="absolute inset-0 h-full w-full object-cover opacity-80 contrast-[1.6] brightness-[1.1] saturate-0 transition duration-300 ease-out group-hover:scale-[1.02] group-hover:opacity-100"
                style={{ imageRendering: "pixelated" }}
              />
              <div className="pointer-events-none absolute inset-0 bg-black/25 mix-blend-multiply" />
              <div className="absolute inset-x-0 bottom-3 left-1/2 z-[1] w-full -translate-x-1/2 px-3 text-center text-base font-mono font-semibold uppercase tracking-[0.12em] text-white">
                {section.label}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
