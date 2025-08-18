import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/providers/react-query";
import { LanguageProvider } from "@/providers/language";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/Navbar";
import { LiteModeProvider } from "@/providers/lite";
import "@/lib/auth";
import Script from "next/script";
import { CookieConsent } from "@/components/CookieConsent";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SewaGo",
  description: "Local services marketplace",
  openGraph: {
    title: "SewaGo",
    description: "Discover and book local services",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="remove-massive-elements" strategy="afterInteractive">
          {`
            // Function to remove massive elements
            function removeMassiveElements() {
              const allElements = document.querySelectorAll('*');
              allElements.forEach(element => {
                const rect = element.getBoundingClientRect();
                const maxSize = Math.max(window.innerWidth, window.innerHeight);
                
                // If element is larger than the viewport, remove it
                if (rect.width > maxSize || rect.height > maxSize) {
                  console.log('Removing massive element:', element);
                  element.remove();
                }
              });
            }
            
            // Run on load and periodically
            removeMassiveElements();
            setInterval(removeMassiveElements, 1000);
            
            // Also run on DOM changes
            const observer = new MutationObserver(removeMassiveElements);
            observer.observe(document.body, { childList: true, subtree: true });
          `}
        </Script>
      </head>
      <body
        className={cn(`${geistSans.variable} ${geistMono.variable} antialiased`, "bg-white text-slate-900")}
      >
        <ReactQueryProvider>
          <LanguageProvider>
            <LiteModeProvider>
              <Navbar />
              {children}
              <CookieConsent />
              <Analytics />
              <SpeedInsights />
            </LiteModeProvider>
          </LanguageProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}