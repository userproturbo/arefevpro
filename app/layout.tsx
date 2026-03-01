import "./globals.css";
import Providers from "./providers";
import Script from "next/script";
import SiteChrome from "./components/navigation/SiteChrome";
import ParticleTransition from "./components/home/ParticleTransition";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="relative min-h-screen bg-black text-white antialiased">
        <Script
          id="clear-dev-overlay"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: "try { localStorage.removeItem('__next_dev_overlay__'); } catch (e) {}",
          }}
        />
        <Providers>
          <SiteChrome>{children}</SiteChrome>
          <ParticleTransition />
        </Providers>
      </body>
    </html>
  );
}
