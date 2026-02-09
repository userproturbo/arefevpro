import "./globals.css";
import Providers from "./providers";
import Script from "next/script";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="relative h-screen overflow-hidden bg-[#04050a] text-white antialiased">
        <Script
          id="clear-dev-overlay"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: "try { localStorage.removeItem('__next_dev_overlay__'); } catch (e) {}",
          }}
        />
        <Providers>
          {children}
        </Providers>  
      </body>
    </html> 
  );
}
