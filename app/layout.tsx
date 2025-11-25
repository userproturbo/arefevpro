import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "MyCrazyLife",
  description: "Личный сайт, фото, видео, музыка и статьи",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-black text-white">
        <Navbar />   {/* Показывается только автору */}
        <main className="max-w-4xl mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
