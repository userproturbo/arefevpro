"use client";

import FacesSection from "./components/FacesSection";
import HeroText from "./components/HeroText";

export default function HomePage() {
    return (
        <div className="min-h-screen">
            <HeroText />
            <FacesSection />
        </div>
    );
}
