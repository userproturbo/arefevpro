"use client";

import FacesSection from "./components/FacesSection";
import HeroSection from "./components/HeroSection";

export default function HomePage() {
    return (
        <div className="min-h-screen">
            <FacesSection />
            <HeroSection />
        </div>
    );
}
