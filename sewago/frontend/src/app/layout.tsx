import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/providers/react-query";
import { LanguageProvider } from "@/providers/language";
import { cn } from "@/lib/utils";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { LiteModeProvider } from "@/providers/lite";
import { AuthProvider } from "@/providers/auth";
import "@/lib/auth";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SewaGo - Reliable Services for Every Home in Nepal",
  description: "Connect with verified local service providers for cleaning, electrical work, gardening, and more. Quality services, trusted professionals across Nepal.",
  keywords: "local services, home services, cleaning, electrical work, gardening, Nepal, Kathmandu, service providers",
  authors: [{ name: "SewaGo Team" }],
  creator: "SewaGo",
  openGraph: {
    title: "SewaGo - Reliable Services for Every Home in Nepal",
    description: "Connect with verified local service providers for cleaning, electrical work, gardening, and more. Quality services, trusted professionals across Nepal.",
    type: "website",
    locale: "en_US",
    siteName: "SewaGo",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SewaGo - Local Services Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SewaGo - Local Services Platform",
    description: "Connect with verified local service providers for cleaning, electrical work, gardening, and more.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
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
        className={cn(`${inter.variable} antialiased`, "min-h-screen bg-white text-gray-900")}
      >
        <AuthProvider>
          <ReactQueryProvider>
            <LanguageProvider>
              <LiteModeProvider>
                {/* Temporarily disabled Header to resolve build issues */}
                {/* <Header /> */}
                <main className="min-h-screen">
                  {children}
                </main>
                <Footer />
              </LiteModeProvider>
            </LanguageProvider>
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
