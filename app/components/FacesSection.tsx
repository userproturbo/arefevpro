"use client";

import Image from "next/image";

const cards = [
    { title: "ABOUT", src: "/img/face1.gif" },
    { title: "THE IMPACT", src: "/img/face2.gif" },
    { title: "STATISTICS", src: "/img/face3.gif" },
    { title: "THE PEOPLE", src: "/img/face4.gif" },
    { title: "SUPPORT", src: "/img/face5.gif" },
];

export default function FacesSection() {
    return (
        <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
                {cards.map((card) => (
                    <div
                        key={card.title}
                        className="flex flex-col h-full bg-[#f4f4f4]/50 border border-[#d5d5d5] shadow-[0_0_3px_rgba(0,0,0,0.2)] overflow-hidden"
                    >
                        <div
                            className="w-full h-[420px] bg-cover bg-top grayscale opacity-90 mix-blend-multiply transition-all duration-300 hover:grayscale-0 hover:brightness-75 hover:contrast-125"
                            style={{ backgroundImage: `url('${card.src}')` }}
                        />
                        <div className="px-3 py-4 text-center">
                            <p className="text-xs uppercase tracking-[0.2em] text-[#777]">
                                {card.title}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
