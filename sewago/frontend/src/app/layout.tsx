import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/providers/react-query";
import { LanguageProvider } from "@/providers/language";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/Navbar";
import { LiteModeProvider } from "@/providers/lite";
import "@/lib/auth";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(`${geistSans.variable} ${geistMono.variable} antialiased`, "bg-white text-slate-900")}
      >
        <ReactQueryProvider>
          <LanguageProvider>
            <LiteModeProvider>
              <Navbar />
              {children}
            </LiteModeProvider>
          </LanguageProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
