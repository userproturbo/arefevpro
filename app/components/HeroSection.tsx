"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HeroSection() {
    return (
        <section className="w-full py-20">
            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10">

                {/* ЛЕВАЯ ЧАСТЬ — большой текст */}
                <div>
                    <h1 className="text-6xl md:text-7xl font-black tracking-tight">
                        CRAZYLIFE
                    </h1>

                    <p className="text-gray-400 mt-6 text-lg">
                        Здесь будет приветственный текст — позже заменим на настоящий.
                    </p>
                </div>

                {/* ПРАВАЯ ЧАСТЬ — карточки */}
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { title: "Обо мне", link: "/about" },
                        { title: "Фото", link: "/photos" },
                        { title: "Видео", link: "/videos" },
                        { title: "Музыка", link: "/music" },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 cursor-pointer hover:border-gray-500 transition"
                        >
                            <Link href={item.link}>
                                <p className="text-xl font-semibold">{item.title}</p>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
