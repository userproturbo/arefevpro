export default function HeroText() {
    return (
        <section className="w-full bg-transparent pt-20 pb-20">
            <div className="max-w-[1500px] mx-auto px-6 flex flex-col md:flex-row justify-between gap-10">
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide uppercase text-white drop-shadow-[0_0_24px_rgba(0,0,0,0.35)]">
                    CRAZYLIFE
                </h1>
                <p className="max-w-xl text-lg leading-relaxed opacity-90 text-white/90">
                    Добро пожаловать в мой мир. Здесь будут фото, видео, музыка и истории
                    путешествий. Всё самое личное, странное и интересное — здесь, в CrazyLife.
                </p>
            </div>
        </section>
    );
}
