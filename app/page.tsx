import HomeGallery from "@/components/HomeGallery";
import SoftBackground from "./components/SoftBackground";

export default function Home() {
  return (
    <>
      <main className="relative w-full h-full overflow-hidden">
        <SoftBackground />
      </main>
      <HomeGallery />
    </>
  );
}
