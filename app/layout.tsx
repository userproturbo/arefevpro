import "./globals.css";
import Navbar from "./components/Navbar";
import SecretAdmin from "./components/SecretAdmin";
import Script from "next/script";


export const metadata = {
  title: "MyCrazyLife",
  description: "Личный сайт, фото, видео, музыка и статьи",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="relative text-white">
        <div className="absolute inset-0 bg-[url('/img/bg.jpg')] bg-cover bg-top bg-no-repeat opacity-30"></div>
        <div className="relative z-10 min-h-screen">
          <Script
            id="clear-dev-overlay"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: "try { localStorage.removeItem('__next_dev_overlay__'); } catch (e) {}",
            }}
          />
          <SecretAdmin />
          <Navbar />   {/* Показывается только автору */}
          <main className="w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
