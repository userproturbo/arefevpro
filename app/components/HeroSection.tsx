"use client";

import Link from "next/link";

export default function HeroSection() {
  return (
    <div className="w-full border-b border-gray-700 pb-10 mb-10">
      {/* Верхняя часть */}
      <div className="flex justify-between items-start px-4 md:px-0 max-w-5xl mx-auto mt-10">
        {/* Логотип */}
        <h1 className="text-[60px] md:text-[90px] font-bold tracking-wider custom-logo drop-shadow-xl">
          CrazyLife
        </h1>

        {/* Приветствие (заглушка) */}
        <p className="text-sm md:text-base max-w-sm leading-relaxed font-mono opacity-80 mt-4">
          Здесь будет твой текст приветствия. Позже придумаем атмосферное
          описание, как на Meetshow.
        </p>
      </div>

      {/* Карточки */}
      <div className="mt-12 flex gap-4 overflow-x-auto px-4 md:px-0 max-w-5xl mx-auto">
        <HeroCard title="Обо мне" link="/about" />
        <HeroCard title="Фото" link="/photos" />
        <HeroCard title="Видео" link="/videos" />
        <HeroCard title="Музыка" link="/music" />
      </div>
    </div>
  );
}

function HeroCard({ title, link }: { title: string; link: string }) {
  return (
    <Link href={link}>
      <div
        className="
          w-[140px] md:w-[200px]
          h-[220px] md:h-[260px]
          bg-gray-200
          relative
          rounded-sm
          overflow-hidden
          shadow-md
          hover:scale-105
          hover:shadow-xl
          transition-all
          duration-300
          cursor-pointer
          grayscale
          hover:grayscale-0
        "
      >
        <div className="absolute inset-0 bg-[url('/texture.jpg')] bg-cover bg-center opacity-80" />
        <div className="absolute bottom-2 w-full text-center text-lg font-bold tracking-wide text-black drop-shadow">
          {title}
        </div>
      </div>
    </Link>
  );
}
