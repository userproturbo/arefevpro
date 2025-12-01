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
        <section className="w-full bg-[url('/img/bg.jpg')] bg-cover bg-top bg-no-repeat pt-20 pb-20">
            <div className="w-full px-6 md:px-12 mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {cards.map((card) => (
                        <div
                            key={card.title}
                            className="flex flex-col h-full bg-white/40 backdrop-blur-[1px] border border-gray-300/30 shadow-[0_0_3px_rgba(0,0,0,0.2)]"
                        >
                            <div className="relative w-full aspect-[2/3] bg-neutral-200">
                                <Image
                                    src={card.src}
                                    alt={card.alt}
                                    fill
                                    sizes="(min-width: 1024px) 220px, (min-width: 640px) 30vw, 100vw"
                                    className="object-cover mix-blend-multiply opacity-90 transition-all duration-300 hover:brightness-75 hover:contrast-125"
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
