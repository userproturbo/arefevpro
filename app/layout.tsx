import "./globals.css";
import Navbar from "./components/Navbar";
import SecretAdmin from "./components/SecretAdmin";


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
