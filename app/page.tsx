import Hero from "./components/Hero";
import SoftBackground from "./components/SoftBackground";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <SoftBackground />
      <Hero />
    </div>
  );
}
