import "./globals.css";
import Providers from "./providers";
import Script from "next/script";
import { Inter } from "next/font/google";
import SidebarNav from "./components/SidebarNav";
import ClientLayout from "./ClientLayout";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata = {
  title: "CRAZYLIFE",
  description: "Фото, видео, музыка и истории в одном месте",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} relative bg-[#04050a] text-white antialiased`}>
        <Script
          id="clear-dev-overlay"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: "try { localStorage.removeItem('__next_dev_overlay__'); } catch (e) {}",
          }}
        />
        <Providers>
          <ClientLayout>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(120,120,255,0.12),transparent_35%),radial-gradient(circle_at_80%_0,rgba(255,120,200,0.16),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(0,200,180,0.14),transparent_28%)] pointer-events-none" />
            <SidebarNav />
            <div className="relative min-h-screen ml-28">
              <main className="w-full pb-12">{children}</main>
            </div>
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
