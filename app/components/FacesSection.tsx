"use client";

import Image from "next/image";

const cards = [
    { title: "ABOUT", src: "/img/face1.gif", alt: "About face" },
    { title: "THE IMPACT", src: "/img/face2.gif", alt: "The impact face" },
    { title: "STATISTICS", src: "/img/face3.gif", alt: "Statistics face" },
    { title: "THE PEOPLE", src: "/img/face4.gif", alt: "The people face" },
    { title: "SUPPORT", src: "/img/face5.gif", alt: "Support face" },
];

export default function FacesSection() {
    return (
        <section className="w-full bg-zinc-50 py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {cards.map((card) => (
                        <div
                            key={card.title}
                            className="flex flex-col h-full bg-white/70 backdrop-blur-sm overflow-hidden border border-neutral-200/60 shadow-sm"
                        >
                            <div className="relative w-full aspect-[2/3] bg-neutral-200">
                                <Image
                                    src={card.src}
                                    alt={card.alt}
                                    fill
                                    sizes="(min-width: 1024px) 220px, (min-width: 640px) 30vw, 100vw"
                                    className="object-cover grayscale"
                                    priority
                                />
                            </div>
                            <div className="px-3 py-4 text-center">
                                <p className="text-xs uppercase tracking-[0.28em] text-neutral-700">
                                    {card.title}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
