"use client";

const cards = [
    { title: "ABOUT", src: "/img/face1.gif" },
    { title: "THE IMPACT", src: "/img/face2.gif" },
    { title: "STATISTICS", src: "/img/face3.gif" },
    { title: "THE PEOPLE", src: "/img/face4.gif" },
    { title: "SUPPORT", src: "/img/face5.gif" },
];

export default function FacesSection() {
    return (
        <section
            id="faces"
            className="w-full bg-cover bg-center"
            style={{ backgroundImage: "url('/img/bg.jpg')" }}
        >
            <div className="max-w-[1400px] mx-auto px-6 pt-12 pb-20">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    {cards.map((card) => (
                        <div
                            key={card.title}
                            className="group flex-1 min-w-[180px] flex flex-col items-center"
                        >
                            <div
                                className="w-full h-[480px] bg-[#dcdcdc] bg-cover bg-top grayscale mix-blend-multiply opacity-90 transition-all duration-200 hover:grayscale-0 hover:brightness-50 hover:contrast-125"
                                style={{ backgroundImage: `url('${card.src}')` }}
                            />
                            <h6 className="uppercase text-xs tracking-wide mt-2 opacity-60 transition-colors duration-200 group-hover:opacity-90 text-[#777]">
                                {card.title}
                            </h6>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
