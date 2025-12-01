"use client";

import FacesSection from "./components/FacesSection";
import HeroText from "./components/HeroText";

export default function HomePage() {
    return (
        <section className="w-full bg-[url('/img/bg.jpg')] bg-top bg-cover bg-no-repeat px-8 py-20">
            <HeroText />
            <FacesSection />
        </section>
    );
}
