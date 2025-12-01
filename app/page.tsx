"use client";

import FacesSection from "./components/FacesSection";
import HeroText from "./components/HeroText";

export default function HomePage() {
    return (
        <main className="min-h-screen">
            <div className="max-w-[1400px] mx-auto px-6 pt-16">
                <HeroText />
            </div>
            <FacesSection />
        </main>
    );
}
