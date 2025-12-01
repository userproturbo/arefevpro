"use client";

import FacesSection from "./components/FacesSection";
import HeroText from "./components/HeroText";

export default function HomePage() {
    return (
        <section className="w-full bg-[url('/img/bg.jpg')] bg-cover bg-fixed bg-top py-16">
            <div className="max-w-[1500px] mx-auto px-8 space-y-12">
                <HeroText />
                <FacesSection />
            </div>
        </section>
    );
}
