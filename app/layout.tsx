import "./globals.css";
import Providers from "./providers";
import Script from "next/script";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="relative bg-[#04050a] text-white antialiased">
        <Script
          id="clear-dev-overlay"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: "try { localStorage.removeItem('__next_dev_overlay__'); } catch (e) {}",
          }}
        />
        <Providers>
          <div className="flex h-screen w-screen overflow-hidden">
            <div className="relative flex h-full flex-1 overflow-hidden">
              <main className="flex-1 overflow-auto">{children}</main>
            </div>
          </div>
        </Providers>  
      </body>
    </html> 
  );
}
