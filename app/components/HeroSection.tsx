"use client";

import { motion } from "framer-motion";

const cards = [
    {
        key: "about",
        title: "Обо мне",
        description: "Кто я, откуда и почему это всё — CrazyLife.",
        href: "#about",
        image: null, // потом подставим реальное фото
    },
    {
        key: "photo",
        title: "Фото",
        description: "Снимки из путешествий, улиц и повседневности.",
        href: "#photo",
        image: null,
    },
    {
        key: "video",
        title: "Видео",
        description: "Короткие ролики, зарисовки и моменты жизни.",
        href: "#video",
        image: null,
    },
    {
        key: "music",
        title: "Музыка",
        description: "Треки, которые сопровождают мой день.",
        href: "#music",
        image: null,
    },
];

export default function HeroSection() {
    return (
        <section className="relative border-b border-white/10 overflow-hidden bg-[radial-gradient(circle_at_top,_#1f2937_0,_#020617_55%,_#000000_100%)]">
            {/* Лёгкий шум / текстура поверх */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-soft-light bg-[radial-gradient(circle_at_0_0,_#ffffff33_0,_transparent_50%),radial-gradient(circle_at_100%_0,_#ffffff26_0,_transparent_55%),radial-gradient(circle_at_50%_100%,_#ffffff1f_0,_transparent_60%)]" />

            <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-20 lg:py-24">
                {/* Верхний блок: заголовок + текст справа */}
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 md:gap-16 mb-14 md:mb-16"
                >
                    <div className="flex-1">
                        <h1 className="text-5xl sm:text-6xl lg:text-[80px] font-semibold tracking-[0.12em] leading-none uppercase text-white drop-shadow-[0_0_24px_rgba(255,255,255,0.15)]">
                            CrazyLife
                        </h1>
                    </div>

                    <div className="flex-1 max-w-xl text-sm sm:text-base leading-relaxed text-gray-200">
                        <p>
                            Добро пожаловать в мой мир. Здесь будут фото, видео, музыка и
                            истории путешествий. Всё самое личное, странное и интересное —{" "}
                            <span className="whitespace-nowrap">здесь, в CrazyLife.</span>
                        </p>
                    </div>
                </motion.div>

                {/* Карточки */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: {
                            opacity: 1,
                            y: 0,
                            transition: {
                                staggerChildren: 0.08,
                                duration: 0.4,
                            },
                        },
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {cards.map((card) => (
                        <motion.a
                            key={card.key}
                            href={card.href}
                            variants={{
                                hidden: { opacity: 0, y: 25 },
                                visible: { opacity: 1, y: 0 },
                            }}
                            whileHover={{ y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            className="group rounded-3xl overflow-hidden bg-[#05060a] border border-white/8 shadow-[0_18px_45px_rgba(0,0,0,0.65)] cursor-pointer transition-transform duration-200"
                        >
                            {/* «Мини-фото» сверху (пока заглушка с градиентом) */}
                            <div className="relative h-40 sm:h-44 overflow-hidden">
                                <div
                                    className="absolute inset-0 bg-gradient-to-br from-zinc-300 via-zinc-500 to-zinc-800 group-hover:scale-105 transition-transform duration-500"
                                    style={
                                        card.image
                                            ? {
                                                backgroundImage: `url(${card.image})`,
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                            }
                                            : undefined
                                    }
                                />
                                {/* Маска / шум */}
                                <div className="absolute inset-0 mix-blend-soft-light opacity-50 bg-[radial-gradient(circle_at_0_0,_rgba(0,0,0,0.6)_0,_transparent_55%),radial-gradient(circle_at_100%_100%,_rgba(0,0,0,0.7)_0,_transparent_55%)]" />
                            </div>

                            {/* Подпись и текст */}
                            <div className="px-4 sm:px-5 py-4 sm:py-5">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <h2 className="text-base sm:text-lg font-semibold text-white">
                                        {card.title}
                                    </h2>
                                    <span className="text-[10px] uppercase tracking-[0.16em] text-gray-400 group-hover:text-gray-200 transition-colors">
                    раздел
                  </span>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-400">
                                    {card.description}
                                </p>
                            </div>

                            {/* Нижняя полоска, как «progress / underline» */}
                            <div className="h-[3px] sm:h-[4px] bg-gradient-to-r from-white/5 via-white/60 to-white/5 group-hover:from-[#38bdf8] group-hover:via-white group-hover:to-[#22c55e] transition-colors duration-300" />
                        </motion.a>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
